export function parseDepartmentScope(
    deptScope?: string,
  ) {
    if (!deptScope) {
      return undefined;
    }
  
    return deptScope
      .split(",")
      .map((department) => department.trim())
      .filter(Boolean);
  }