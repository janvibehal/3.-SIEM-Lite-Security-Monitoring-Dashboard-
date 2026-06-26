import { Request, Response, NextFunction } from "express";
import { RuleService } from "../services/rule.service";

export class RuleController {
  constructor(private ruleService: RuleService) {}

  createRule = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const rule = await this.ruleService.createRule(req.body);

      return res.status(201).json({
        success: true,
        data: rule,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllRules = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const rules = await this.ruleService.getAllRules();

      return res.status(200).json({
        success: true,
        data: rules,
      });
    } catch (error) {
      next(error);
    }
  };

  getRuleById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const rule = await this.ruleService.getRuleById(req.params.id);

      return res.status(200).json({
        success: true,
        data: rule,
      });
    } catch (error) {
      next(error);
    }
  };

  updateRule = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const rule = await this.ruleService.updateRule(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        data: rule,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteRule = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const rule = await this.ruleService.deleteRule(req.params.id);

      return res.status(200).json({
        success: true,
        data: rule,
      });
    } catch (error) {
      next(error);
    }
  };
}