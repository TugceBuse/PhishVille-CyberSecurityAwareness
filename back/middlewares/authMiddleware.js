const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Yetkilendirme tokeni eksik ya da biçimi geçersiz.' });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({ error: 'Token bulunamadı.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      clockTolerance: 5, // birkaç sn tolerans
    });

    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token.' });
  }
};
