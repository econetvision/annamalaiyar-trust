import secrets
import string
from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def utcnow():
    return datetime.now(timezone.utc)


class Subscriber(db.Model):
    __tablename__ = "subscribers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False, unique=True)
    email = db.Column(db.String(160))
    address = db.Column(db.String(300))
    town = db.Column(db.String(120))
    agent_code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    status = db.Column(db.String(20), nullable=False, default="pending")  # pending | verified
    created_at = db.Column(db.DateTime, default=utcnow)
    verified_at = db.Column(db.DateTime)

    # registration_type: agent | vendor | consumer
    registration_type = db.Column(db.String(20), nullable=False, default="agent")
    # vendor_type (only set when registration_type == "vendor"):
    # manufacturer | supplier_trader | retailer | seller
    vendor_type = db.Column(db.String(30))

    # Optional payout details - either a bank account, or a UPI id, or neither.
    account_holder_name = db.Column(db.String(120))
    bank_name = db.Column(db.String(120))
    ifsc_code = db.Column(db.String(20))
    account_number = db.Column(db.String(30))
    upi_id = db.Column(db.String(80))

    voucher = db.relationship("Voucher", backref="subscriber", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "address": self.address,
            "town": self.town,
            "agent_code": self.agent_code,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "verified_at": self.verified_at.isoformat() if self.verified_at else None,
            "voucher": self.voucher.to_dict() if self.voucher else None,
            "registration_type": self.registration_type,
            "vendor_type": self.vendor_type,
            "account_holder_name": self.account_holder_name,
            "bank_name": self.bank_name,
            "ifsc_code": self.ifsc_code,
            "account_number": self.account_number,
            "upi_id": self.upi_id,
        }

    @staticmethod
    def generate_agent_code():
        # 7 random digits = 10,000,000 combinations per year. At 100,000
        # subscribers that's only 1% of the space, so collisions (and the
        # retry loop below) stay negligible instead of guaranteed near the
        # end, as they would be with the old 5-digit (100,000-slot) space.
        year = datetime.now().year
        while True:
            seq = "".join(secrets.choice(string.digits) for _ in range(7))
            code = f"AT{year}-{seq}"
            if not Subscriber.query.filter_by(agent_code=code).first():
                return code


class Voucher(db.Model):
    __tablename__ = "vouchers"

    id = db.Column(db.Integer, primary_key=True)
    subscriber_id = db.Column(db.Integer, db.ForeignKey("subscribers.id"), nullable=False, unique=True)
    code = db.Column(db.String(30), unique=True, nullable=False)
    amount = db.Column(db.Integer, nullable=False, default=250)
    issued_at = db.Column(db.DateTime, default=utcnow)
    redeemed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "code": self.code,
            "amount": self.amount,
            "issued_at": self.issued_at.isoformat() if self.issued_at else None,
            "redeemed": self.redeemed,
        }

    @staticmethod
    def generate_code():
        while True:
            token = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
            code = f"GV-{token}"
            if not Voucher.query.filter_by(code=code).first():
                return code


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    category = db.Column(db.String(80))
    weight = db.Column(db.String(40))
    price = db.Column(db.Integer)
    image_url = db.Column(db.String(300))
    description = db.Column(db.String(400))
    active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "weight": self.weight,
            "price": self.price,
            "image_url": self.image_url,
            "description": self.description,
        }


class Advertisement(db.Model):
    __tablename__ = "advertisements"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(160), nullable=False)
    image_url = db.Column(db.String(300))
    link = db.Column(db.String(300))
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "image_url": self.image_url,
            "link": self.link,
        }


class Service(db.Model):
    __tablename__ = "services"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    icon = db.Column(db.String(40))
    order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "icon": self.icon}
