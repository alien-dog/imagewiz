from datetime import datetime
from app import db, bcrypt

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    credit_balance = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_admin = db.Column(db.Boolean, default=False)
    
    # Relationships
    recharge_history = db.relationship('RechargeHistory', backref='user', lazy=True)
    matting_history = db.relationship('MattingHistory', backref='user', lazy=True)
    
    def set_password(self, password):
        """Hash password before storing"""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')
        
    def check_password(self, password):
        """Check if provided password matches stored hash"""
        return bcrypt.check_password_hash(self.password, password)
        
    def to_dict(self):
        """Convert user to dictionary for API responses"""
        return {
            'id': self.id,
            'username': self.username,
            'credit_balance': self.credit_balance,
            'created_at': self.created_at.isoformat(),
            'is_admin': self.is_admin
        }
        
class RechargeHistory(db.Model):
    __tablename__ = 'recharge_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    credit_gained = db.Column(db.Integer, nullable=False)
    payment_status = db.Column(db.String(20), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    stripe_payment_id = db.Column(db.String(100))
    is_yearly = db.Column(db.Boolean, default=False)
    package_id = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert recharge history to dictionary for API responses"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': float(self.amount),
            'credit_gained': self.credit_gained,
            'payment_status': self.payment_status,
            'payment_method': self.payment_method,
            'stripe_payment_id': self.stripe_payment_id,
            'is_yearly': self.is_yearly,
            'package_id': self.package_id,
            'created_at': self.created_at.isoformat()
        }
        
class MattingHistory(db.Model):
    __tablename__ = 'matting_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    original_image_url = db.Column(db.String(255), nullable=False)
    processed_image_url = db.Column(db.String(255), nullable=False)
    credit_spent = db.Column(db.Integer, default=1, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert matting history to dictionary for API responses"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'original_image_url': self.original_image_url,
            'processed_image_url': self.processed_image_url,
            'credit_spent': self.credit_spent,
            'created_at': self.created_at.isoformat()
        }