import { WebComponent } from '@/lib/components'
import type { DialogContext } from '@/lib/dialogs/context'
import { CloseDialogEvent } from '@/lib/dialogs/events/close-dialog'
import { WebComponentTrait } from './WebComponentTrait'

export interface DialogTraitConfig {
  getContext: () => DialogContext
}

export default class DialogTrait<T = void> implements WebComponentTrait {
  public target: WebComponent
  private config: DialogTraitConfig

  constructor (target: WebComponent, config: DialogTraitConfig) {
    this.target = target
    this.config = config
  }

  close (data: T) {
    window.dispatchEvent(new CloseDialogEvent(this.config.getContext().id, data))
  }
}
