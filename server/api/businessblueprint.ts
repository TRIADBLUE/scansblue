import { Router } from "express";

const router = Router();

// Placeholder for BusinessBlueprint API integration
// This will handle the connection to the larger project for brand notoriety
router.get("/status", (req, res) => {
  res.json({ status: "ready", integration: "businessblueprint" });
});

export default router;
