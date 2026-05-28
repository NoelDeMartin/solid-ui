import { TemplateResult } from 'lit'
import { DialogController } from './DialogController'
import { ShowDialogEvent } from './events/show-dialog'

export function showDialog (template: TemplateResult) {
  document.dispatchEvent(new ShowDialogEvent(new DialogController(template)))
}
