
## To Install

```bash
$ cp secret-template.json secret.json
```

Add email and password to `secret.json` file

```bash
$ npm i
```

## To Run

Have a csv file with times in it with the following format `<required>` `[optional]`

```
<start>,<finish>,[todo],[note],[reason]
```

```bash
$ node hubstaff.js my-times.csv
```
