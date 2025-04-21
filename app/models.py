from datetime import datetime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from flask_sqlalchemy import SQLAlchemy

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

class Account(db.Model):
    __tablename__ = 'accounts'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    firebase_uid: Mapped[str] = mapped_column(unique=True)
    role: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now, onupdate=datetime.now)
    last_login_at: Mapped[datetime] = mapped_column(nullable=True)
    
    user: Mapped['User'] = db.relationship(back_populates="account", uselist=False)

class User(db.Model):
    __tablename__ = 'users'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(db.ForeignKey('accounts.id'), nullable=False)
    account: Mapped[Account] = db.relationship("Account", back_populates="user")
    phone_number: Mapped[str] = mapped_column(unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column(nullable=False)
    last_name: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now)
    # the code below is commented out for possible use in future implementations
    # street_address: Mapped[str] = mapped_column(nullable=False)
    # city: Mapped[str] = mapped_column(nullable=False)
    # state: Mapped[str] = mapped_column(nullable=False)
    # zip_code: Mapped[str] = mapped_column(nullable=False)
    
    account: Mapped['Account'] = db.relationship(back_populates="user")