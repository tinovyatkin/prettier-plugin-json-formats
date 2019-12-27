import {Printer, Parser} from 'prettier';

export interface JsonTypePlugin {
  parsers: Record<string, Parser>;
  printers: Record<string, Printer>;
}
