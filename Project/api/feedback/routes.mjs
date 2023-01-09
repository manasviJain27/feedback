import { feedbackCreation, findFeedback, updateField } from "./feedback.mjs";
const authRoutes = (router) => {
  router.post("/feedback-creation", (req, res) => feedbackCreation(req, res));
  router.post("/find-feedback", (req, res) => findFeedback(req, res));
  router.post("/update-field", (req, res) => updateField(req, res));
  // router.post("/");
};

export default authRoutes;
