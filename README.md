# Engineslist 🐫

Engineslist will check engines you have defined in a file or `package.json`
section that satisfies your global or locally (e.g. via NPM) installed program
version.

![preview](https://raw.githubusercontent.com/muuvmuuv/engineslist/master/assets/preview.png)

**Why?**

NPM has a concept like this but only on installing programs into your project.
So for example someone is downloading/cloning your project and has unmet
versions e.g. Node, he will likely get an error or the results are not the same
as with another version you have used locally. Engineslist will prevent this
case and furthermore let yourself keep track on which versions you want to
develop your project on.

**Where to go?**

Have a look at the [Roadmap](#Roadmap) to see what is coming next. I don't have
much time to work on this continuosly, so I would love to see folks contributing
to make this awesome.

## How to use

### Programmatically

```ts
import { Engineslist } from 'engineslist'

const engineslist = new Engineslist(
  {
    // or store them in a engineslist file
    node: '>=10.3.0',
  },
  {
    /* options */
  },
)
```

> Psst! Have a look at our [tests](./test) to see more examples.

#### Options

| Name        | Type      | Default         | Description                                                                                    |
| ----------- | --------- | --------------- | ---------------------------------------------------------------------------------------------- |
| debug       | `boolean` | `false`         | Enables more verbose output.                                                                   |
| cwd         | `string`  | `process.cwd()` | Modify the string to search for engines.                                                       |
| ignoreLocal | `boolean` | `true`          | Ignore local installed node modules.                                                           |
| strict      | `boolean` | `false`         | Every version must be a real version from the package releases, if available (e.g. npmjs.org). |
| silent      | `boolean` | `false`         | Just no interactive output.                                                                    |

#### Config

You must store a list of engines with a valid semver in your root project
folder. Engineslist will search for a plain text files named `engineslist` or
`engines`, a YAML formated file named `engineslist.yaml` or `engines.yaml` or a
section inside your `package.json` file named `engines`.

- engineslist
- engines
- engineslist.yaml
- engines.yaml
- package.json

### Command Line

```shell
  Usage
    $ engineslist <directory>

  Options
    --ignoreLocal, -i  Ignore local installed node modules (true)
    --strict, -s       Version will be checked against package releases (false)

    --debug     Debug program
    --version   Show version
    --help      Show help
```

## Roadmap

- [ ] Add better tests
- [x] General usage better explained
- [ ] Store config and engine in some kind of storage for global use
- [ ] Usage with other managers than NPM
  - [ ] pip
  - [ ] gem
  - [ ] brew
- [x] Add "Do you want to install them now?"
- [x] Check against valid upstream version (valid NPM version?)
