const asyncHandler = (fn) => {
  return (req, res, next) => {
    console.log("Request:::", req.body);
    fn(req, res, next).catch(next);
  };
};
module.exports = asyncHandler;
