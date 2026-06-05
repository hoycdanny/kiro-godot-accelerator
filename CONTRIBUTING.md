# Contributing Guidelines

Thank you for your interest in contributing to Kiro Godot Accelerator! We welcome
contributions from the community.

## How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes following the code style below
4. Run tests: `npm test`
5. Run type checking: `npx tsc --noEmit`
6. Commit with conventional commits: `feat: add shader template for outline effect`
7. Push and create a Pull Request

## Code Style

- TypeScript with strict mode
- ESLint for linting
- Follow existing patterns in `src/`
- Export interfaces and types from each module
- Include JSDoc comments with official documentation references

## Steering Files

- Written in Traditional Chinese with English summary headers
- Must include official Godot documentation links
- Code examples must use Godot 4.x syntax with static typing

## Templates

- JSON format with clear `name` and `description` fields
- Include `notes` array for important caveats
- Validate against real Godot behavior before submitting

## Testing

- Unit tests in `tests/unit/`
- Property-based tests in `tests/property/` (using fast-check)
- Coverage target: 80%+

## Commit Message Convention

```
feat: add new feature
fix: fix a bug
docs: documentation changes
chore: maintenance tasks
test: add or fix tests
refactor: code refactoring without behavior change
```

## Security Issue Notifications

If you discover a security vulnerability, please report it privately by emailing
the maintainer. Do not create a public issue for security vulnerabilities.

## License

By contributing, you agree that your contributions will be licensed under the
MIT License.
