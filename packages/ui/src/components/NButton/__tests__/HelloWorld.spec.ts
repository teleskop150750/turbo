import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import NButton from "../src/NButton.vue";

describe("NButton", () => {
  it("renders properly", () => {
    const wrapper = mount(NButton);
    expect(wrapper.text()).toContain("button");
  });
});
