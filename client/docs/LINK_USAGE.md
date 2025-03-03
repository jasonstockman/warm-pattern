# Next.js Link Component Best Practices

This document provides guidelines for using the Next.js `Link` component correctly to avoid common errors.

## Common Link Issues

One of the most common errors in Next.js applications is:

```
Uncaught Error: Invalid <Link> with <a> child. Please remove <a> or use <Link legacyBehavior>.
```

This occurs because the Next.js `Link` component has changed how it works in version 13+.

## Correct Usage of Link Component

### Modern Usage (Preferred)

In Next.js 13 and higher, the `Link` component automatically creates an `<a>` tag. You should pass all properties (like `className`) directly to the `Link` component:

```tsx
// ✅ CORRECT
<Link href="/about" className="nav-link">
  About Us
</Link>
```

### Legacy Usage (For Backward Compatibility)

If you need to have an `<a>` tag as a child of the `Link` component (for example, when customizing the anchor element or using another component that renders an anchor), use the `legacyBehavior` prop:

```tsx
// ✅ CORRECT
<Link href="/about" legacyBehavior>
  <a className="nav-link">About Us</a>
</Link>
```

## Incorrect Usage

```tsx
// ❌ INCORRECT - This will cause an error
<Link href="/about">
  <a className="nav-link">About Us</a>
</Link>

// ❌ INCORRECT - Don't wrap other components that render <a> tags without legacyBehavior
<Link href="/about">
  <CustomComponent> // If this renders an <a> tag internally
    About Us
  </CustomComponent>
</Link>
```

## Links with Other Components

If you need to use a Link with a component that isn't an `<a>` tag (like a Button):

```tsx
// ✅ CORRECT - Wrapping a Button component
<Link href="/about" legacyBehavior>
  <a>
    <Button>About Us</Button>
  </a>
</Link>

// ✅ CORRECT - Alternative approach
<Link href="/about" passHref legacyBehavior>
  <Button as="a">About Us</Button>
</Link>
```

## Testing Link Components

When writing tests for components using Links:

```tsx
// ✅ Mock the Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: jest.fn(),
  }),
}));

// Then test your component normally
```

## Automatic Linting

The project includes an ESLint rule (`jsx-a11y/anchor-is-valid`) configured to catch improper usage of the Link component. Run the linter before committing to catch these issues early:

```bash
pnpm lint
```

## Additional Resources

- [Next.js Documentation on Links](https://nextjs.org/docs/api-reference/next/link)
- [Next.js Migration Guide (from version 12 to 13)](https://nextjs.org/docs/upgrading#nextlink) 