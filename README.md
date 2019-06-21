# Engine Checker 🎛

Engine Checker will check engines you have defined in a file or `package.json`
section that satisfies your global or locally installed program version.

![preview](https://raw.githubusercontent.com/muuvmuuv/engine-checker/master/assets/preview.png)

**Why?**

Because NPM does this only when someone else installs you program but sometimes
you don't want your friends to get errors with having the wrong node version and
it is somehow usefull for some people.

## How to use

### Programmatically

```ts
import EngineChecker from 'engine-checker'

const checker = new EngineChecker({
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
    $ engine-checker <directory>

  Options
    --ignoreLocal, -i  Ignore local installed node modules (true)

    --debug     Debug program
    --version   Show version
    --help      Show help
```
