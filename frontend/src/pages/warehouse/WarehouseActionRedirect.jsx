import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function WarehouseActionRedirect() {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/grievance/complaint-user/view/${code}`)
      .then(res => {
        const c = res.data;

        if (c.status !== "IN_PROGRESS_WH") {
          navigate("/warehouse");
          return;
        }

        if (c.complaint_type === "PHYSICAL") {
          navigate(`/warehouse/action/physical/${code}`);
        } else if (c.complaint_type === "ADR") {
          navigate(`/warehouse/action/adr/${code}`);
        } else if (c.complaint_type === "QUALITY") {
          navigate(`/warehouse/action/quality/${code}`);
        }
      });
  }, [code, navigate]);

  return null;
}
