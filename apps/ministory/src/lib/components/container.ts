import type { Pose } from "poseui";

export const createContainer = (pose: Pose) =>
  pose.as("div").flex().flex_col().cls("flex-[4]").p(2);
