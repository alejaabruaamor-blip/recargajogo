// Diagnostico: mostra quais variaveis de ambiente existem (sem revelar valores)
module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const names = Object.keys(process.env).filter(function (k) {
    return /FREE ?PAY|FREEPAY|PIX/i.test(k);
  });
  res.status(200).json({
    freepay_like_vars: names,
    FREEPAY_PUBLIC_KEY: !!process.env.FREEPAY_PUBLIC_KEY,
    FREEPAY_SECRET_KEY: !!process.env.FREEPAY_SECRET_KEY,
  });
};
