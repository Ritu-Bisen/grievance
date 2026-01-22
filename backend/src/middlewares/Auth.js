const Auth = (req, res, next) => {
  const ACTIVE_WAREHOUSE = "WH-001"; // change to WH-002 to test

  req.user = {
    role: "WAREHOUSE",
    warehouseCode: ACTIVE_WAREHOUSE
  };

  next();
};

export default Auth;
