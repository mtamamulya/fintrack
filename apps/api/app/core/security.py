from datetime import datetime, timedelta, timezone
import os, base64, hashlib
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXP_MINUTES)
    return jwt.encode({"sub": user_id, "type": "access", "exp": exp},
                      settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXP_MINUTES)
    return jwt.encode({"sub": user_id, "type": "refresh", "exp": exp},
                      settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    return payload["sub"]

# AES-256-GCM field-level encryption
_ENC_KEY = bytes.fromhex(settings.FIELD_ENC_KEY)

def encrypt_field(plaintext: str) -> str:
    nonce = os.urandom(12)
    ct    = AESGCM(_ENC_KEY).encrypt(nonce, plaintext.encode(), None)
    return base64.b64encode(nonce + ct).decode()

def decrypt_field(ciphertext: str) -> str:
    data      = base64.b64decode(ciphertext)
    nonce, ct = data[:12], data[12:]
    return AESGCM(_ENC_KEY).decrypt(nonce, ct, None).decode()
