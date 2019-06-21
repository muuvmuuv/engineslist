# Engineslist 🐫

Engineslist will check engines you have defined in a file or `package.json`
section that satisfies your global or locally (e.g. via NPM) installed program
version.

![preview](https://raw.githubusercontent.com/muuvmuuv/engineslist/master/assets/preview.png)

**Why?**

Because NPM does this only when someone else installs you program but sometimes
you don't want your friends to get errors with having the wrong node version and
it is somehow usefull for some people with different programming languages.

## How to use

### Programmatically

```ts
import Engineslist from 'engineslist'

const engineslist = new Engineslist({
  engines: {
    node: '>=10.3.0',
  },
})
```

> Psst! Have a look at our [tests](./test) to see more examples.

#### Options

| Name    | Type      | Default         | Description                              |
| ------- | --------- | --------------- | ---------------------------------------- |
| debug   | `boolean` | `false`         | Enables more verbose output.             |
| cwd     | `string`  | `process.cwd()` | Modify the string to search for engines. |
| engines | `Engines` | `null`          | Pass your own object of engines.         |
| silent  | `boolean` | `true`          | Just no interactive output.              |

### Command Line

```shell
  Usage
    $ engineslist <directory>

  Options
    --ignoreLocal, -i  Ignore local installed node modules (true)

    --debug     Debug program
    --version   Show version
    --help      Show help
```
