import { describe, expect, it } from "#test";
import { Builder } from "./index";

interface User {
  name: string;
  isActive: boolean;
  gender: "male" | "female" | "other";
  age: number;
}

class UserBuilder extends Builder<User> {
  constructor(protected override product: User) {
    super();
  }

  setName(name: string) {
    return this.register((product) => {
      product.name = name;
    });
  }

  setActive(isActive: boolean) {
    return this.register((product) => {
      product.isActive = isActive;
    });
  }

  setGender(gender: User["gender"]) {
    return this.register((product) => {
      product.gender = gender;
    });
  }

  setAge(age: number) {
    return this.register((product) => {
      product.age = age;
    });
  }
}

describe(Builder, () => {
  it("should build a product", () => {
    const builder = new UserBuilder({
      age: 0,
      gender: "other",
      isActive: false,
      name: "",
    });

    expect(builder.isActive).toBe(false);

    builder.setActive(true).setGender("male").setAge(35).setName("Nguyen Van A");

    const data = builder.build();

    expect(data).toEqual({
      name: "Nguyen Van A",
      isActive: true,
      gender: "male",
      age: 35,
    });
    expect(builder.isActive).toBe(true);
  });
});
