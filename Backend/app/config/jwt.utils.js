import jwt from "jsonwebtoken";

export const generateToken = (payload, secret, expiry) => {
  return jwt.sign(payload, secret, {
    expiresIn: expiry,
  });
};

export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
