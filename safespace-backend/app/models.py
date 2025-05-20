from datetime import datetime, date
from typing import List
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from flask_sqlalchemy import SQLAlchemy

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

user_investment_risk_assessment = db.Table(
    'user_investment_risk_assessments',
    Base.metadata,
    db.Column('user_id', db.ForeignKey('users.id')),
    db.Column('investment_risk_assessment_id', db.ForeignKey('investment_risk_assessments.id'))
)

user_loan_risk_assessment = db.Table(
    'user_loan_risk_assessments',
    Base.metadata,
    db.Column('user_id', db.ForeignKey('users.id')),
    db.Column('loan_risk_assessment_id', db.ForeignKey('loan_risk_assessments.id'))
)

class Account(db.Model):
    __tablename__ = 'accounts'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    firebase_uid: Mapped[str] = mapped_column(unique=True, nullable=False)
    role: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now)
    last_login: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now, onupdate=datetime.now)
    email_verified: Mapped[bool] = mapped_column(default=False)
    
    user: Mapped['User'] = db.relationship(back_populates="account", uselist=False)

class User(db.Model):
    __tablename__ = 'users'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(db.ForeignKey('accounts.id'), nullable=False)
    phone_number: Mapped[str] = mapped_column(unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column(nullable=False)
    last_name: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now, onupdate=datetime.now)
    # the code below is commented out for possible use in future implementations
    # street_address: Mapped[str] = mapped_column(nullable=False)
    # city: Mapped[str] = mapped_column(nullable=False)
    # state: Mapped[str] = mapped_column(nullable=False)
    # zip_code: Mapped[str] = mapped_column(nullable=False)
    
    account: Mapped['Account'] = db.relationship(back_populates="user", uselist=False)
    investment_risk_assessments: Mapped[List['InvestmentRiskAssessment']] = db.relationship(secondary=user_investment_risk_assessment, back_populates="users")
    loan_risk_assessments: Mapped[List['LoanRiskAssessment']] = db.relationship(secondary=user_loan_risk_assessment, back_populates="users")

class InvestmentRiskAssessment(db.Model):
    __tablename__ = 'investment_risk_assessments'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    start_date: Mapped[date] = mapped_column(nullable=False)
    end_date: Mapped[date] = mapped_column(nullable=False)
    risk_score: Mapped[float] = mapped_column(nullable=False)
    risk_level: Mapped[str] = mapped_column(nullable=False)
    return_percent: Mapped[float] = mapped_column(nullable=False)
    initial_investment: Mapped[float] = mapped_column(nullable=False)
    final_value: Mapped[float] = mapped_column(nullable=False)
    portfolio_volatility: Mapped[float] = mapped_column(nullable=False)
    portfolio_sharpe_ratio: Mapped[float] = mapped_column(nullable=False)
    updated_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now, onupdate=datetime.now)
    assessment_date: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now)
    
    users: Mapped[List['User']] = db.relationship(secondary=user_investment_risk_assessment, back_populates="investment_risk_assessments")
    assets: Mapped[List['Asset']] = db.relationship(back_populates="investment_risk_assessment", cascade="all, delete-orphan")
    
    @property
    def tickers(self) -> List[str]:
        return [asset.ticker for asset in self.assets]

class Asset(db.Model):
    __tablename__ = 'assets'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    investment_risk_assessment_id: Mapped[int] = mapped_column(db.ForeignKey('investment_risk_assessments.id'), nullable=False)
    ticker: Mapped[str] = mapped_column(nullable=False)
    allocation: Mapped[float] = mapped_column(nullable=False)
    start_price: Mapped[float] = mapped_column(nullable=False)
    end_price: Mapped[float] = mapped_column(nullable=False)
    initial_investment: Mapped[float] = mapped_column(nullable=False)
    final_value: Mapped[float] = mapped_column(nullable=False)
    return_percent: Mapped[float] = mapped_column(nullable=False)
    volatility: Mapped[float] = mapped_column(nullable=False)
    sharpe_ratio: Mapped[float] = mapped_column(nullable=False)
    max_drawdown: Mapped[float] = mapped_column(nullable=False)
    updated_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now, onupdate=datetime.now)
    
    investment_risk_assessment: Mapped['InvestmentRiskAssessment'] = db.relationship(back_populates="assets")

class LoanRiskAssessment(db.Model):
    __tablename__ = 'loan_risk_assessments'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    loan_amount: Mapped[int] = mapped_column(nullable=False)
    loan_term: Mapped[int] = mapped_column(nullable=False)
    interest_rate: Mapped[float] = mapped_column(nullable=False)
    credit_score: Mapped[int] = mapped_column(nullable=False)
    after_tax_income: Mapped[int] = mapped_column(nullable=False)
    monthly_debt: Mapped[int] = mapped_column(nullable=False)
    debt_to_income_ratio: Mapped[float] = mapped_column(nullable=False)
    loan_to_income_ratio: Mapped[float] = mapped_column(nullable=False)
    credit_utilization: Mapped[float] = mapped_column(nullable=False)
    loan_risk: Mapped[str] = mapped_column(nullable=False)
    num_dependents: Mapped[int] = mapped_column(nullable=False)
    income_source_count: Mapped[int] = mapped_column(nullable=False)
    credit_card_limit: Mapped[int] = mapped_column(nullable=False)
    has_real_estate: Mapped[bool] = mapped_column(nullable=False)
    updated_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now, onupdate=datetime.now)
    
    users: Mapped[List['User']] = db.relationship(secondary=user_loan_risk_assessment, back_populates="loan_risk_assessments")