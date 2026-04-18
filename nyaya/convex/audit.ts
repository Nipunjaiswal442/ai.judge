import { mutation as rawMutation } from "./_generated/server";
import { DataModel } from "./_generated/dataModel";

export const auditMutation = ((args: any) => {
  return rawMutation({
    args: args.args,
    handler: async (ctx, payload) => {
      // Execute the original handler
      const result = await args.handler(ctx, payload);

      // Simple audit logging for any mutation using this wrapper
      try {
        // Normally we'd extract user from ctx.auth.getUserIdentity() 
        // but our NextAuth setup stores auth state differently or we pass it in payload
        // We'll just do a generic log based on the function context
        
        await ctx.db.insert("auditLogs", {
          // Fallback to a placeholder user if we can't determine it
          userId: (payload as any).lawyerId || (payload as any).complainantLawyerId || (payload as any).assignedJudgeId || "jg79ktttwxy9j79qj8vtw325ms74xcmr" as any, 
          action: "MUTATION_EXECUTED",
          entityType: "system",
          entityId: "unknown",
          timestamp: Date.now(),
        });
      } catch (e) {
        console.error("Audit log failed", e);
      }

      return result;
    },
  });
}) as any; // Using any to bypass complex type constraints for this MVP
