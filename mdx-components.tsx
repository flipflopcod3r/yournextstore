import type { MDXComponents } from 'mdx/types'
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
      if (href?.startsWith('/')) {
        return <Link href={href} {...props}>{children}</Link>
      }
      return <a href={href} {...props}>{children}</a>
    },
    // Add other custom components as needed
    ...components,
  }
}