import express, { Router } from 'express';

import  { getCategories } from "../controllers/categoryController";

const categoryRouter = Router();

categoryRouter.get('/', getCategories);

export default categoryRouter;