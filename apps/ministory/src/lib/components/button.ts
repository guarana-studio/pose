import pose from "poseui";
import { z } from "zod";

export const button = pose
  .as("button")
  .input(z.object({ text: z.string() }))
  .child((props) => props.text);
