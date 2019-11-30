import { v, create } from '@dojo/framework/core/vdom';

export interface PageProperties {}

const factory = create().properties<PageProperties>();

export default factory(function Page({ properties }) {});
