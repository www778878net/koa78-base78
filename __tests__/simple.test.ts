function alwaysTrue(): boolean {
  return true;
}

describe('简单测试', () => {
  it('总是返回true', () => {
    expect(alwaysTrue()).toBe(true);
  });
});