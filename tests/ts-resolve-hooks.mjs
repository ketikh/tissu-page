const HAS_EXTENSION = /\.[a-z0-9]+$/i;

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".") && !HAS_EXTENSION.test(specifier)) {
    try {
      return await nextResolve(`${specifier}.ts`, context);
    } catch {
      // Fall through to the default resolution.
    }
  }
  return nextResolve(specifier, context);
}
