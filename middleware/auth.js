const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];  // on récupère le token de la requête entrante
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // on le vérifie
    const userId = decodedToken.userId; // on récupère l'id du token
    if (req.body.userId && req.body.userId !== userId) { // on compare l'userID de la requête à celui du token
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};