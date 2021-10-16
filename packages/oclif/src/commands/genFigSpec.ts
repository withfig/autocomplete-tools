import { Command, flags } from '@oclif/command'
import * as fs from 'fs';

export default class FigCompletionsCommand extends Command {
  static description = 'Generate a Fig completion spec'

  static flags = {
    help: flags.help({ char: 'h' }),
    output: flags.string({ char: 'o', description: 'filepath to export completion spec (do not specify file extension)' }),
    lang: flags.string({ char: "l", options: [" ts", "js"], default: "ts" }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const { args, flags } = this.parse(FigCompletionsCommand)

    const spec = {
      name: this.config.name,
      description: "",
      subcommands: this.config.commands.map(command => {
        if (command.hidden) {
          return null
        }

        const name = command.aliases.length > 0 ? [command.id].concat(command.aliases) : command.id

        return {
          name,
          description: command.description?.split('\n')[0] ?? "",
          options: Object.keys(command.flags).map(flagName => {
            const flag = command.flags[flagName]

            if (flag.hidden) {
              return null
            }

            let name = flag.char ? [`-${flag.char}`, `--${flagName}`] : `--${flagName}`
            var flagSpec = {
              name,
              description: flag.description ?? "",
            } as any

            if (flag.type == "option") {
              var args = {
                name: flagName,
                isOptional: false
              } as any

              if (flag.options) {
                args.suggestions = flag.options
              }

              flagSpec["args"] = args
            }

            return flagSpec
          }).filter(flagSpec => { return flagSpec != null }),
          args: command.args.map(arg => {

            if (arg.hidden) {
              return null
            }

            var argSpec = {
              name: arg.name,
            } as any

            if (arg.description) {
              argSpec["description"] = arg.description
            }

            if (arg.options) {
              argSpec["suggestions"] = arg.options
            }

            argSpec["isOptional"] = arg.required != true

            return argSpec
          }).filter(argSpec => { return argSpec != null })
        }
      }).filter(subcommandSpec => { return subcommandSpec != null }),

    }

    // let string = JSON.stringify(spec, null, 4)
    // this.log(string)

    let saveJsonAsSpec = (json: any, path: string, exportTypescript: boolean = flags.lang == "ts") => {
      let prefix = exportTypescript ? 'const completionSpec: Fig.Spec =' : 'var completionSpec ='
      let extension = exportTypescript ? '.ts' : '.js'
      let final = `${prefix} ${JSON.stringify(json, null, 4)}\n\nexport default completionSpec`
      fs.writeFileSync(path + extension, final)
    }

    if (flags.output) {
      saveJsonAsSpec(spec, flags.output)
    } else {
      this.log(JSON.stringify(spec, null, 4))
    }

  }
}
