const { z } = require('zod');

const GameSchema = z.object({
  title: z.string().min(1, "Title is required"),
  platform: z.string().min(1, "Platform is required"),
  players: z.number().int().positive("Players must be a positive integer"),
  coverUrl: z.string().url("Must be a valid URL").optional()
});

module.exports = { GameSchema };
