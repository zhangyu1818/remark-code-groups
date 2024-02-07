import { visit } from 'unist-util-visit'
import { nanoid } from 'nanoid'

import type { Plugin } from 'unified'

export interface RemarkCodeGroupsOptions {
  prefix?: string
  tag?: string
  className?: {
    tabs?: string
    tabLabel?: string
    blocks?: string
  }
}

const remarkCodeGroups: Plugin<[RemarkCodeGroupsOptions]> = (options = {}) => {
  const { prefix = '', tag = 'div', className = {} } = options
  const {
    tabs = `${prefix}tabs`,
    tabLabel = `${prefix}tab-label`,
    blocks = `${prefix}blocks`,
  } = className

  const containerCls = `${prefix}code-group`
  return tree => {
    visit(tree, (node: any) => {
      if (node.type === 'containerDirective') {
        const { name, children } = node
        if (name !== 'code-group') return

        const radioName = `group-${nanoid(5)}`

        node.children = [
          {
            type: 'html',
            value: `<div class="${tabs}">${children
              .map((child: any) => {
                const [, name] = child.meta.match(/\[(.+)]/)
                return `<label class="${tabLabel}"><input type="radio" name="${radioName}"/>${name}</label>`
              })
              .join('')}</div>`,
          },
          { type: 'html', value: `<div class="${blocks}">` },
          ...children,
          { type: 'html', value: '</div>' },
        ]

        const data = node.data || (node.data = {})
        data.hName = tag
        data.hProperties = { class: containerCls }
      }
    })
  }
}

export default remarkCodeGroups
