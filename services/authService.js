const APIError = require("../utils/error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const expiresJWT = 3600; // 60 Minuten in Sekunden
const Database = require("../utils/Database");

module.exports = {
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const { rows } = await Database.pool.query(
        'SELECT * FROM "User" WHERE username = $1',
        [username],
      );

      const user = rows[0];

      if (!user) {
        const dummy = await bcrypt.compare(
          password,
          "$2b$14$M6m/TTFtDa/aM/thQ8d.juZu4jxW34NPmOW5VW.rez.paoM10fRNu",
        ); // Dummy-Vergleich, um Timing-Angriffe zu verhindern
        return APIError.errorWrongCredentials();
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return APIError.errorWrongCredentials();
      }

      const JWTtoken = jwt.sign(
        {
          sub: user.id,
          username: user.username,
          role: user.role,
          initialPassword: user.initialPassword,
        },
        process.env.JWT_SECRET,
        { expiresIn: expiresJWT, algorithm: "HS256" },
      );

      return {
        message: "Login successful",
        accessToken: JWTtoken,
      };
    } catch (error) {
      if (error.statusCode) {
        return error;
      }
      console.error(error);
      return APIError.errorUnknown();
    }
  },
};
