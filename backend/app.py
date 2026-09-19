import os
import re
import uuid

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

from models import db, Subscriber, Voucher, Product, Advertisement, Service

load_dotenv()

ADMIN_KEY = os.environ.get("ADMIN_KEY", "annamalaiyar2026")
PHONE_RE = re.compile(r"^[6-9]\d{9}$")
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///" + os.path.join(app.instance_path, "atc.db")
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["UPLOAD_FOLDER"] = os.path.join(app.instance_path, "uploads")
    app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5 MB per upload
    os.makedirs(app.instance_path, exist_ok=True)
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    CORS(app)
    db.init_app(app)

    with app.app_context():
        db.create_all()
        _seed_and_sync()

    register_routes(app)
    return app


def _seed_and_sync():
    if Service.query.count() == 0:
        services = [
            ("Diagnostic Center", "🩺"),
            ("Automobile Service", "🚗"),
            ("Sports Club", "🏸"),
            ("House Keeping", "🧹"),
            ("Tours & Travels", "✈️"),
            ("Hotels & Resorts", "🏨"),
            ("Cell Care Service", "🔧"),
            ("Cell Phone Service", "📱"),
            ("Plumbing & Electrical", "🔌"),
            ("Fruits & Vegetables", "🥦"),
            ("Grocery", "🛒"),
            ("Cakes & Bakes", "🎂"),
            ("Real Estate & Construction", "🏗️"),
            ("Agri Farm & Land Dev", "🌾"),
            ("Education & Land Dev", "🎓"),
            ("Fabrication & More", "⚙️"),
        ]
        for i, (name, icon) in enumerate(services):
            db.session.add(Service(name=name, icon=icon, order=i))

    # One-time cleanup: remove the old flyer-cropped demo products (image
    # files no longer ship with the app). Products are now entirely
    # admin-uploaded via /api/admin/products.
    for product in Product.query.filter(Product.image_url.like("/assets/products/%")).all():
        db.session.delete(product)

    seed_ads = [
        ("Annamalaiyar Trade Centre - Ponni Boiled Rice", "/assets/products-legacy.jpg", "/products"),
        ("Business Trade Fair Expo - 10 Days Only", "/assets/expo-banner.jpg", "/expo"),
        ("Annamalaiyar Trust - Our Legacy", "/assets/legacy-banner.jpg", "/legacy"),
    ]
    existing_ad_images = {a.image_url for a in Advertisement.query.all()}
    for title, image_url, link in seed_ads:
        if image_url not in existing_ad_images:
            db.session.add(Advertisement(title=title, image_url=image_url, link=link))

    db.session.commit()


def require_admin(req):
    key = req.headers.get("X-Admin-Key") or req.args.get("admin_key")
    return key == ADMIN_KEY


def _save_uploaded_image(app, image):
    """Validate and persist an uploaded image file. Returns its public URL, or
    None if no file was given. Raises ValueError on an invalid file type."""
    if not image or not image.filename:
        return None
    ext = image.filename.rsplit(".", 1)[-1].lower() if "." in image.filename else ""
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValueError("Image must be one of: " + ", ".join(sorted(ALLOWED_IMAGE_EXTENSIONS)))
    filename = f"{uuid.uuid4().hex}.{ext}"
    image.save(os.path.join(app.config["UPLOAD_FOLDER"], secure_filename(filename)))
    return f"/api/uploads/{filename}"


def _delete_uploaded_image(app, image_url):
    if image_url and image_url.startswith("/api/uploads/"):
        filename = image_url.rsplit("/", 1)[-1]
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], secure_filename(filename))
        if os.path.exists(filepath):
            os.remove(filepath)


def register_routes(app):
    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    @app.get("/api/services")
    def services():
        rows = Service.query.order_by(Service.order).all()
        return jsonify([s.to_dict() for s in rows])

    @app.get("/api/products")
    def products():
        rows = Product.query.filter_by(active=True).order_by(Product.id.desc()).all()
        return jsonify([p.to_dict() for p in rows])

    @app.get("/api/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    @app.post("/api/admin/products")
    def admin_create_product():
        if not require_admin(request):
            return jsonify({"error": "Invalid admin key."}), 401

        name = (request.form.get("name") or "").strip()
        category = (request.form.get("category") or "").strip()
        weight = (request.form.get("weight") or "").strip()
        description = (request.form.get("description") or "").strip()
        price_raw = (request.form.get("price") or "").strip()
        image = request.files.get("image")

        if not name:
            return jsonify({"error": "Product name is required."}), 400
        try:
            price = int(price_raw)
            if price <= 0:
                raise ValueError
        except (TypeError, ValueError):
            return jsonify({"error": "Please enter a valid price."}), 400

        try:
            image_url = _save_uploaded_image(app, image)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        product = Product(
            name=name,
            category=category or None,
            weight=weight or None,
            price=price,
            image_url=image_url,
            description=description or None,
        )
        db.session.add(product)
        db.session.commit()
        return jsonify(product.to_dict()), 201

    @app.delete("/api/admin/products/<int:product_id>")
    def admin_delete_product(product_id):
        if not require_admin(request):
            return jsonify({"error": "Invalid admin key."}), 401

        product = Product.query.get(product_id)
        if not product:
            return jsonify({"error": "Product not found."}), 404

        _delete_uploaded_image(app, product.image_url)
        db.session.delete(product)
        db.session.commit()
        return jsonify({"ok": True})

    @app.get("/api/advertisements")
    def advertisements():
        rows = Advertisement.query.filter_by(active=True).order_by(Advertisement.id).all()
        return jsonify([a.to_dict() for a in rows])

    @app.post("/api/admin/advertisements")
    def admin_create_advertisement():
        if not require_admin(request):
            return jsonify({"error": "Invalid admin key."}), 401

        title = (request.form.get("title") or "").strip()
        link = (request.form.get("link") or "").strip()
        image = request.files.get("image")

        if not title:
            return jsonify({"error": "Advertisement title is required."}), 400
        if not image or not image.filename:
            return jsonify({"error": "An image is required for the advertisement."}), 400

        try:
            image_url = _save_uploaded_image(app, image)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        ad = Advertisement(title=title, link=link or None, image_url=image_url)
        db.session.add(ad)
        db.session.commit()
        return jsonify(ad.to_dict()), 201

    @app.delete("/api/admin/advertisements/<int:ad_id>")
    def admin_delete_advertisement(ad_id):
        if not require_admin(request):
            return jsonify({"error": "Invalid admin key."}), 401

        ad = Advertisement.query.get(ad_id)
        if not ad:
            return jsonify({"error": "Advertisement not found."}), 404

        _delete_uploaded_image(app, ad.image_url)
        db.session.delete(ad)
        db.session.commit()
        return jsonify({"ok": True})

    @app.get("/api/expo")
    def expo():
        return jsonify(
            {
                "title": "வணிக வர்த்தக கண்காட்சி - Business Trade Fair Expo",
                "organizer": "Annamalaiyar Direct Centre Private Limited",
                "ticket_price": 2500,
                "claim_value": 5000,
                "welcome_gift_voucher": 500,
                "welcome_gift_voucher_note": "For first-time visitors only",
                "total_value": 5500,
                "duration_days": 10,
                "banner_image": "/assets/expo-banner.jpg",
                "prizes": ["1st Prize", "2nd Prize", "3rd Prize", "100 Consolation Prizes"],
                "description": "Lucky Draw entry for all ticket holders. Every first-time visitor also receives a ₹500 welcome gift voucher at entry. Enjoy the trade fair with your family and explore stalls from trusted vendors.",
            }
        )

    @app.get("/api/legacy")
    def legacy():
        return jsonify(
            {
                "trust_name": "அண்ணாமலை டிரஸ்ட் (Annamalaiyar Trust)",
                "founded": "2012",
                "location": "Chinna Salem - 606201, Kallakurichi District",
                "parent_group": "Sri Muruga Vilas Group of Company (Since 1923)",
                "milestone": "100 Years of Trust - 2nd Century, Grand Celebration",
                "affiliates": [
                    "Annamalaiyar Thondu Nirmanam (Annamalaiyar Trust)",
                    "Annamalaiyar Direct Centre Private Limited",
                    "Annamalayaar Trade Centre Pvt. Ltd.",
                ],
                "legacy_image": "/assets/legacy-banner.jpg",
                "verification_note": "This page displays the trust's official commemorative artwork for member verification of authenticity.",
            }
        )

    @app.post("/api/register")
    def register():
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        phone = (data.get("phone") or "").strip()
        email = (data.get("email") or "").strip()
        address = (data.get("address") or "").strip()
        town = (data.get("town") or "").strip()

        if not name or len(name) < 3:
            return jsonify({"error": "Please enter a valid full name."}), 400
        if not PHONE_RE.match(phone):
            return jsonify({"error": "Please enter a valid 10-digit Indian mobile number."}), 400
        if Subscriber.query.filter_by(phone=phone).first():
            return jsonify({"error": "This phone number is already registered."}), 409

        subscriber = Subscriber(
            name=name,
            phone=phone,
            email=email or None,
            address=address or None,
            town=town or None,
            agent_code=Subscriber.generate_agent_code(),
            status="pending",
        )
        db.session.add(subscriber)
        db.session.commit()
        return jsonify(subscriber.to_dict()), 201

    @app.get("/api/status/<agent_code>")
    def status(agent_code):
        subscriber = Subscriber.query.filter_by(agent_code=agent_code.strip().upper()).first()
        if not subscriber:
            return jsonify({"error": "No subscriber found with this agent code."}), 404
        return jsonify(subscriber.to_dict())

    @app.post("/api/admin/verify")
    def admin_verify():
        if not require_admin(request):
            return jsonify({"error": "Invalid admin key."}), 401

        data = request.get_json(silent=True) or {}
        agent_code = (data.get("agent_code") or "").strip().upper()
        subscriber = Subscriber.query.filter_by(agent_code=agent_code).first()
        if not subscriber:
            return jsonify({"error": "No subscriber found with this agent code."}), 404

        if subscriber.status == "verified":
            return jsonify(subscriber.to_dict())

        from models import utcnow

        subscriber.status = "verified"
        subscriber.verified_at = utcnow()
        voucher = Voucher(
            subscriber_id=subscriber.id,
            code=Voucher.generate_code(),
            amount=250,
        )
        db.session.add(voucher)
        db.session.commit()
        return jsonify(subscriber.to_dict())

    @app.get("/api/admin/subscribers")
    def admin_subscribers():
        if not require_admin(request):
            return jsonify({"error": "Invalid admin key."}), 401

        try:
            page = max(1, int(request.args.get("page", 1)))
        except ValueError:
            page = 1
        try:
            per_page = min(200, max(1, int(request.args.get("per_page", 50))))
        except ValueError:
            per_page = 50

        query = Subscriber.query
        search = (request.args.get("search") or "").strip()
        if search:
            like = f"%{search}%"
            query = query.filter(
                db.or_(
                    Subscriber.name.ilike(like),
                    Subscriber.phone.ilike(like),
                    Subscriber.agent_code.ilike(like),
                )
            )

        total = query.count()
        rows = (
            query.order_by(Subscriber.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )
        return jsonify(
            {
                "items": [s.to_dict() for s in rows],
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": max(1, (total + per_page - 1) // per_page),
            }
        )


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
