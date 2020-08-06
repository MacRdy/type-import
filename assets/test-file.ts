import * as vscode from 'vscode';
import * as vscode1 from 'vscode';
import {
    CallHierarchyItem,
    BreakpointsChangeEvent
} from 'vscode';

const testFn = (): vscode.Breakpoint => {
    console.log('Test it!');
    throw new Error();
    // import
};
