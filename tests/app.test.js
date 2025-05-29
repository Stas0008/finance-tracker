const request = require("supertest");
const errorApp = require("express")();
const app = require("../../mongooselab-Dream63/app");

describe("App entrypoint", () => {
    it("should respond with 200 for GET /", async () => {
        const res = await request(app).get("/");
        expect(res.statusCode).toBe(200);
    });

    it("should return Swagger JSON spec on /api-docs.json", async () => {
        const res = await request(app).get("/api-docs.json");
        expect(res.statusCode).toBe(200);
        expect(res.headers["content-type"]).toContain("application/json");
        expect(res.body.openapi).toBe("3.0.0");
    });

    it("should serve Swagger UI on /api-docs", async () => {
        const res = await request(app).get("/api-docs/");
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Swagger UI");
    });

    it("should return 404 for unknown route", async () => {
        const res = await request(app).get("/nonexistent-route");
        expect(res.statusCode).toBe(404);
        expect(res.text).toContain("Not Found");
    });

    it("should handle errors gracefully (500)", async () => {
        // Штучно згенеруємо помилку
        errorApp.get("/error", (req, res, next) => {
            const err = new Error("Forced error");
            err.status = 500;
            next(err);
        });
        errorApp.use(app); // додати головний app як middleware
        const res = await request(errorApp).get("/error");
        expect(res.statusCode).toBe(500);
        expect(res.text).toContain("Error");
    });
    it("should return 404 for unknown routes", async () => {
        const res = await request(app).get("/non-existent");
        expect(res.statusCode).toBe(404);
    });
});
