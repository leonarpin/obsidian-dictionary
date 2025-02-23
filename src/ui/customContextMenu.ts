import { Menu, WorkspaceLeaf } from "obsidian";
import type DictionaryPlugin from "src/main";
import { VIEW_TYPE } from "src/_constants";

export default function handleContextMenu(instance: CodeMirror.Editor, e: MouseEvent, plugin: DictionaryPlugin) {
    if (!plugin.settings.shouldShowCustomContextMenu) {
        return;
    }
    //prevent opening the default context Menu
    e.preventDefault();

    //"re-add" the default commands for cut, copy and paste
    const fileMenu = new Menu(plugin.app);

    if (instance.getSelection()) {
        fileMenu.addItem((item) => {
            item.setTitle(`Cut`)
                .setIcon('cut')
                .onClick((_) => {
                    copy(instance.getSelection());
                    instance.replaceSelection("");
                });
        });
        fileMenu.addItem((item) => {
            item.setTitle(`Copy`)
                .setIcon('copy')
                .onClick((_) => {
                    copy(instance.getSelection());
                });
        });
    }
    fileMenu.addItem((item) => {
        item.setTitle(`Paste`)
            .setIcon('paste')
            .onClick(async (_) => {
                instance.replaceSelection(await navigator.clipboard.readText());
            });
    });

    //add obsidian dictionary specific commands
    if (instance.getSelection()) {
        fileMenu.addSeparator();
        if (!plugin.settings.shouldShowSynonymPopover) {
            fileMenu.addItem((item) => {
                item.setTitle(`Show Synonyms`)
                    .setIcon('synonyms')
                    .onClick(async (_) => {
                        plugin.handlePointerUp();
                    });
            });
        }
        fileMenu.addItem((item) => {
            item.setTitle(`Look up`)
                .setIcon('quote-glyph')
                .onClick(async (_) => {
                    let leaf: WorkspaceLeaf = plugin.app.workspace.getLeavesOfType(VIEW_TYPE).first();
                    if(!leaf){
                        leaf = plugin.app.workspace.getRightLeaf(false);
                        await leaf.setViewState({
                            type: VIEW_TYPE,
                        });
                    }
                    //@ts-ignore
                    leaf.view.query(instance.getSelection());
                    plugin.app.workspace.revealLeaf(leaf);
                });
        });
    }

    fileMenu.showAtPosition({ x: e.clientX, y: e.clientY });
}

function copy(string: string) {
    navigator.clipboard.writeText(string);
}