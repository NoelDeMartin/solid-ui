import { TemplateResult } from 'lit'
import { generateId } from '../ids'

export class DialogController {
  public readonly id: string
  public readonly template: TemplateResult

  constructor (template: TemplateResult) {
    this.template = template
    this.id = generateId()
  }
}
