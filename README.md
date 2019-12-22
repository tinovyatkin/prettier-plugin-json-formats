# prettier-plugin-json-formats

This [prettier][prettier] plugin contains rules for formatting specific JSON file formats.

To use this package, install it using

```bash
yarn add -D prettier-plugin-json-formats
```

and configure prettier to use the formats you want.

- Package.json files:

  ```yml
  overrides:
    - files: package.json
      options:
        parser: package-json
  ```

- Angular CLI workspace files:

  ```yml
  overrides:
    - files: angular.json
      options:
        parser: angular-cli
  ```

## License

Available under an MIT license.

[prettier]: https://prettier.io/
