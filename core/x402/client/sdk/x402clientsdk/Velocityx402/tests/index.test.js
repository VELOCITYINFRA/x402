import { buildVelocityURL_FOR_GET ,buildVelocityURL_FOR_POST,buildHeaders,buildHeadersForPOST} from "../index.js"

describe("buildVelocityURL_FOR_GET", () => {
  test("builds a GET URL with given tag", () => {
    expect(buildVelocityURL_FOR_GET("x1212")).toBe("https://xvelocity.dev/api/x1212");
  });

  });


  describe("buildVelocityURL_FOR_POST", () => {
  test("returns the fixed POST endpoint", () => {
    expect(buildVelocityURL_FOR_POST()).toBe("https://xvelocity.dev/api/postv");
  });
});

describe("buildHeaders", () => {
  test("returns x-wallet and content-type headers", () => {
    const h = buildHeaders("wallet123");
    expect(h).toEqual({
      "x-wallet": "wallet123",
      "content-type": "application/json"
    });
  });
});


describe("buildHeadersForPOST", () => {
  test("returns x-wallet, x402id and content-type headers", () => {
    const h = buildHeadersForPOST("wallet123", "id123");
    expect(h).toEqual({
      "x-wallet": "wallet123",
      "x402id": "id123",
      "content-type": "application/json"
    });
  });

});
