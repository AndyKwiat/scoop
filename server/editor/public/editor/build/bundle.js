
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const AuthStore = writable({loggedIn:false});
    const SERVER_URL = window.location.hostname.includes("localhost") ?"http://localhost:3000":"";
    const StatusLog =  writable({status:""});

    function addStatus( str ){
        StatusLog.set({status:str});
    }

    function SaveItem( item ){
        addStatus( "Saving item...");
    }

    /* src/Frame.svelte generated by Svelte v3.32.3 */

    const file = "src/Frame.svelte";

    function create_fragment(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-fs0gu");
    			add_location(div, file, 21, 0, 451);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Frame", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Frame> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Frame extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Auth.svelte generated by Svelte v3.32.3 */

    const { console: console_1 } = globals;
    const file$1 = "src/Auth.svelte";

    // (95:4) {#if fetchPromise == null}
    function create_if_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Log in";
    			attr_dev(button, "class", "svelte-1ekx70u");
    			add_location(button, file$1, 95, 8, 2669);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onLoginClicked*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(95:4) {#if fetchPromise == null}",
    		ctx
    	});

    	return block;
    }

    // (85:0) <Frame>
    function create_default_slot(ctx) {
    	let h1;
    	let t1;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let t6;
    	let p;
    	let t7;
    	let mounted;
    	let dispose;
    	let if_block = /*fetchPromise*/ ctx[2] == null && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Scoop it Up";
    			t1 = space();
    			label0 = element("label");
    			t2 = text("username:\n        ");
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			t4 = text("password:\n        ");
    			input1 = element("input");
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			p = element("p");
    			t7 = text(/*msg*/ ctx[3]);
    			add_location(h1, file$1, 85, 4, 2427);
    			add_location(input0, file$1, 88, 8, 2486);
    			add_location(label0, file$1, 86, 4, 2452);
    			attr_dev(input1, "type", "password");
    			add_location(input1, file$1, 92, 8, 2569);
    			add_location(label1, file$1, 90, 4, 2535);
    			set_style(p, "color", "white");
    			add_location(p, file$1, 97, 4, 2733);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, label0, anchor);
    			append_dev(label0, t2);
    			append_dev(label0, input0);
    			set_input_value(input0, /*username*/ ctx[0]);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, label1, anchor);
    			append_dev(label1, t4);
    			append_dev(label1, input1);
    			set_input_value(input1, /*password*/ ctx[1]);
    			insert_dev(target, t5, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
    				set_input_value(input0, /*username*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}

    			if (/*fetchPromise*/ ctx[2] == null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(t6.parentNode, t6);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*msg*/ 8) set_data_dev(t7, /*msg*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(label0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(label1);
    			if (detaching) detach_dev(t5);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(85:0) <Frame>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let frame;
    	let current;

    	frame = new Frame({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(frame.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(frame, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const frame_changes = {};

    			if (dirty & /*$$scope, msg, fetchPromise, password, username*/ 527) {
    				frame_changes.$$scope = { dirty, ctx };
    			}

    			frame.$set(frame_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(frame.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(frame.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(frame, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const COOKIE = "auth";

    function createCookie(name, value, days) {
    	var expires;

    	if (days) {
    		let date = new Date();
    		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    		expires = "; expires=" + date.toGMTString();
    	} else {
    		expires = "";
    	}

    	document.cookie = name + "=" + value + expires + "; path=/";
    }

    function getCookie(c_name) {
    	if (document.cookie.length > 0) {
    		let c_start = document.cookie.indexOf(c_name + "=");

    		if (c_start != -1) {
    			c_start = c_start + c_name.length + 1;
    			let c_end = document.cookie.indexOf(";", c_start);

    			if (c_end == -1) {
    				c_end = document.cookie.length;
    			}

    			return unescape(document.cookie.substring(c_start, c_end));
    		}
    	}

    	return "";
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Auth", slots, []);
    	let username = "";
    	let password = "";
    	let fetchPromise = null;
    	let msg = "";
    	let cook = getCookie(COOKIE);
    	console.log("GOT THE COOKIE: " + cook);

    	if (cook.length > 0) {
    		AuthStore.set({ loggedIn: true, key: cook });
    	}

    	AuthStore.subscribe(as => {
    		if (as.loggedIn == false) {
    			createCookie(COOKIE, ""); // delete
    		}
    	});

    	function onLoginClicked() {
    		$$invalidate(3, msg = "Logging in...");
    		$$invalidate(2, fetchPromise = fetchCredentials());

    		fetchPromise.then(res => {
    			res.text().then(txt => {
    				// console.log(txt + " " + res.status +  " RESPONSE")
    				if (res.ok) {
    					createCookie(COOKIE, txt, 2);
    					AuthStore.set({ loggedIn: true, key: txt });
    				} else {
    					$$invalidate(3, msg = txt + " " + res.status);
    				}
    			});
    		}).finally(() => {
    			$$invalidate(2, fetchPromise = null);
    		});
    	}

    	function fetchCredentials() {
    		let p = fetch(SERVER_URL + "/editor/login", {
    			method: "get",
    			headers: new Headers({
    					Authorization: "Basic +" + btoa(btoa(username + ":" + password))
    				})
    		});

    		return p;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Auth> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate(0, username);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$capture_state = () => ({
    		COOKIE,
    		Frame,
    		AuthStore,
    		SERVER_URL,
    		username,
    		password,
    		fetchPromise,
    		msg,
    		cook,
    		onLoginClicked,
    		fetchCredentials,
    		createCookie,
    		getCookie
    	});

    	$$self.$inject_state = $$props => {
    		if ("username" in $$props) $$invalidate(0, username = $$props.username);
    		if ("password" in $$props) $$invalidate(1, password = $$props.password);
    		if ("fetchPromise" in $$props) $$invalidate(2, fetchPromise = $$props.fetchPromise);
    		if ("msg" in $$props) $$invalidate(3, msg = $$props.msg);
    		if ("cook" in $$props) cook = $$props.cook;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		username,
    		password,
    		fetchPromise,
    		msg,
    		onLoginClicked,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Auth extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Auth",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/AppFrame.svelte generated by Svelte v3.32.3 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/AppFrame.svelte";

    // (48:0) {#if $StatusLog.status?.length > 0 }
    function create_if_block_1(ctx) {
    	let div;
    	let t_value = /*$StatusLog*/ ctx[2].status + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "statusLog svelte-1se4znc");
    			add_location(div, file$2, 48, 0, 1161);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$StatusLog*/ 4 && t_value !== (t_value = /*$StatusLog*/ ctx[2].status + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(48:0) {#if $StatusLog.status?.length > 0 }",
    		ctx
    	});

    	return block;
    }

    // (53:8) {#if menuOpen }
    function create_if_block$1(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*flushCacheBtnText*/ ctx[0]);
    			attr_dev(button, "class", "svelte-1se4znc");
    			add_location(button, file$2, 53, 8, 1324);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", stop_propagation(/*OnFlushCacheClicked*/ ctx[3]), false, false, true);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*flushCacheBtnText*/ 1) set_data_dev(t, /*flushCacheBtnText*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(53:8) {#if menuOpen }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t0;
    	let div;
    	let span;
    	let t1;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$StatusLog*/ ctx[2].status?.length > 0 && create_if_block_1(ctx);
    	let if_block1 = /*menuOpen*/ ctx[1] && create_if_block$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div = element("div");
    			span = element("span");
    			t1 = text("⚙\n        ");
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "admin svelte-1se4znc");
    			add_location(span, file$2, 51, 4, 1226);
    			attr_dev(div, "class", "svelte-1se4znc");
    			add_location(div, file$2, 50, 0, 1216);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t1);
    			if (if_block1) if_block1.m(span, null);
    			append_dev(div, t2);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$StatusLog*/ ctx[2].status?.length > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*menuOpen*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(span, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (if_block1) if_block1.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $AuthStore;
    	let $StatusLog;
    	validate_store(AuthStore, "AuthStore");
    	component_subscribe($$self, AuthStore, $$value => $$invalidate(7, $AuthStore = $$value));
    	validate_store(StatusLog, "StatusLog");
    	component_subscribe($$self, StatusLog, $$value => $$invalidate(2, $StatusLog = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AppFrame", slots, ['default']);
    	let flushCacheBtnText = "Flush Cache3";
    	let menuOpen = false;

    	function OnFlushCacheClicked() {
    		$$invalidate(0, flushCacheBtnText = "Flushing...");

    		fetch(SERVER_URL + "/flushcache", {
    			method: "get",
    			headers: new Headers({ "Authorization": $AuthStore.key })
    		}).then(resp => {
    			if (resp.ok) {
    				$$invalidate(0, flushCacheBtnText = "Flushed!");
    			} else {
    				$$invalidate(0, flushCacheBtnText = "Failed Flushing");
    				console.error("Failed flushing: " + resp.statusText);
    			}
    		}).catch(e => {
    			$$invalidate(0, flushCacheBtnText = "Failed Flushing");
    			console.error("Failed flushing: " + e.message);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<AppFrame> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(1, menuOpen = !menuOpen);
    	};

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		AuthStore,
    		SERVER_URL,
    		StatusLog,
    		flushCacheBtnText,
    		menuOpen,
    		OnFlushCacheClicked,
    		$AuthStore,
    		$StatusLog
    	});

    	$$self.$inject_state = $$props => {
    		if ("flushCacheBtnText" in $$props) $$invalidate(0, flushCacheBtnText = $$props.flushCacheBtnText);
    		if ("menuOpen" in $$props) $$invalidate(1, menuOpen = $$props.menuOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		flushCacheBtnText,
    		menuOpen,
    		$StatusLog,
    		OnFlushCacheClicked,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class AppFrame extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AppFrame",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/ActivityRow.svelte generated by Svelte v3.32.3 */
    const file$3 = "src/ActivityRow.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (98:8) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("⚠");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(98:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (96:45) 
    function create_if_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("✖");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(96:45) ",
    		ctx
    	});

    	return block;
    }

    // (94:8) {#if !item.scoop_status || item.scoop_status == "green" }
    function create_if_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("☑");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(94:8) {#if !item.scoop_status || item.scoop_status == \\\"green\\\" }",
    		ctx
    	});

    	return block;
    }

    // (106:8) {#each item.types as tag }
    function create_each_block_1(ctx) {
    	let span;
    	let t_value = /*tag*/ ctx[10] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "svelte-162ne0l");
    			add_location(span, file$3, 106, 12, 2564);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && t_value !== (t_value = /*tag*/ ctx[10] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(106:8) {#each item.types as tag }",
    		ctx
    	});

    	return block;
    }

    // (111:8) {#if item.photos?.length > 0 }
    function create_if_block_1$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*item*/ ctx[0].photos;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1) {
    				each_value = /*item*/ ctx[0].photos;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(111:8) {#if item.photos?.length > 0 }",
    		ctx
    	});

    	return block;
    }

    // (112:8) {#each item.photos as ph}
    function create_each_block(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "height", "125px");
    			attr_dev(img, "max-width", "20%");
    			if (img.src !== (img_src_value = "https://www.stirfrygames.com/img/125/" + /*ph*/ ctx[7].photo_reference + "-125.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[0].name);
    			add_location(img, file$3, 112, 12, 2719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && img.src !== (img_src_value = "https://www.stirfrygames.com/img/125/" + /*ph*/ ctx[7].photo_reference + "-125.jpg")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*item*/ 1 && img_alt_value !== (img_alt_value = /*item*/ ctx[0].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(112:8) {#each item.photos as ph}",
    		ctx
    	});

    	return block;
    }

    // (121:0) {#if jsRawText}
    function create_if_block$2(ctx) {
    	let div;
    	let button;
    	let pre;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "X";
    			pre = element("pre");
    			t1 = text(/*jsRawText*/ ctx[1]);
    			add_location(button, file$3, 121, 31, 3069);
    			add_location(pre, file$3, 121, 82, 3120);
    			attr_dev(div, "class", "jsraw_overlay svelte-162ne0l");
    			add_location(div, file$3, 121, 4, 3042);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, pre);
    			append_dev(pre, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*jsRawText*/ 2) set_data_dev(t1, /*jsRawText*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(121:0) {#if jsRawText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let tr;
    	let td;
    	let div7;
    	let div3;
    	let t0_value = /*item*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2_value = /*item*/ ctx[0].vicinity + "";
    	let t2;
    	let t3;
    	let div1;
    	let t4;
    	let t5_value = /*item*/ ctx[0].business_status + "";
    	let t5;
    	let t6;
    	let div2;
    	let span;
    	let t7;
    	let div4;
    	let t8;
    	let div5;
    	let t9;
    	let div6;
    	let button;
    	let t11;
    	let div7_style_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*item*/ ctx[0].scoop_status || /*item*/ ctx[0].scoop_status == "green") return create_if_block_2;
    		if (/*item*/ ctx[0].scoop_status == "red") return create_if_block_3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let each_value_1 = /*item*/ ctx[0].types;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block1 = /*item*/ ctx[0].photos?.length > 0 && create_if_block_1$1(ctx);
    	let if_block2 = /*jsRawText*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td = element("td");
    			div7 = element("div");
    			div3 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			t4 = text("Status:");
    			t5 = text(t5_value);
    			t6 = space();
    			div2 = element("div");
    			span = element("span");
    			if_block0.c();
    			t7 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			div5 = element("div");
    			if (if_block1) if_block1.c();
    			t9 = space();
    			div6 = element("div");
    			button = element("button");
    			button.textContent = "jsRaw";
    			t11 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", "vicinity svelte-162ne0l");
    			add_location(div0, file$3, 90, 34, 2069);
    			attr_dev(div1, "class", "business_status svelte-162ne0l");
    			add_location(div1, file$3, 91, 4, 2118);
    			add_location(span, file$3, 92, 30, 2213);
    			attr_dev(div2, "class", "scoop_status svelte-162ne0l");
    			add_location(div2, file$3, 92, 4, 2187);
    			attr_dev(div3, "class", "name svelte-162ne0l");
    			add_location(div3, file$3, 90, 4, 2039);
    			attr_dev(div4, "class", "types svelte-162ne0l");
    			add_location(div4, file$3, 104, 4, 2497);
    			attr_dev(div5, "class", "pic svelte-162ne0l");
    			add_location(div5, file$3, 109, 4, 2616);
    			add_location(button, file$3, 118, 8, 2952);
    			attr_dev(div6, "class", "jsraw_button svelte-162ne0l");
    			add_location(div6, file$3, 117, 4, 2917);
    			attr_dev(div7, "class", "container svelte-162ne0l");

    			attr_dev(div7, "style", div7_style_value = /*item*/ ctx[0]?.scoop_status == "red"
    			? "background-color:rgb(237, 153, 153)"
    			: /*item*/ ctx[0]?.scoop_status == "yellow"
    				? "background-color:yellow"
    				: "");

    			add_location(div7, file$3, 88, 0, 1877);
    			add_location(td, file$3, 87, 4, 1872);
    			add_location(tr, file$3, 87, 0, 1868);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td);
    			append_dev(td, div7);
    			append_dev(div7, div3);
    			append_dev(div3, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div0);
    			append_dev(div0, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, span);
    			if_block0.m(span, null);
    			append_dev(div7, t7);
    			append_dev(div7, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			append_dev(div7, t8);
    			append_dev(div7, div5);
    			if (if_block1) if_block1.m(div5, null);
    			append_dev(div7, t9);
    			append_dev(div7, div6);
    			append_dev(div6, button);
    			append_dev(div7, t11);
    			if (if_block2) if_block2.m(div7, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(button, "click", /*click_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*item*/ 1 && t0_value !== (t0_value = /*item*/ ctx[0].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*item*/ 1 && t2_value !== (t2_value = /*item*/ ctx[0].vicinity + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*item*/ 1 && t5_value !== (t5_value = /*item*/ ctx[0].business_status + "")) set_data_dev(t5, t5_value);

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(span, null);
    				}
    			}

    			if (dirty & /*item*/ 1) {
    				each_value_1 = /*item*/ ctx[0].types;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*item*/ ctx[0].photos?.length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(div5, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*jsRawText*/ ctx[1]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$2(ctx);
    					if_block2.c();
    					if_block2.m(div7, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*item*/ 1 && div7_style_value !== (div7_style_value = /*item*/ ctx[0]?.scoop_status == "red"
    			? "background-color:rgb(237, 153, 153)"
    			: /*item*/ ctx[0]?.scoop_status == "yellow"
    				? "background-color:yellow"
    				: "")) {
    				attr_dev(div7, "style", div7_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block0.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ActivityRow", slots, []);
    	let { item } = $$props;
    	let jsRawText = null;

    	function OnJSRawClicked(item) {
    		$$invalidate(1, jsRawText = JSON.stringify(item, null, 2));
    	}

    	function OnScoopStatusClicked(it) {
    		if (item.scoop_status == "red") $$invalidate(0, item.scoop_status = "yellow", item); else if (item.scoop_status == "yellow") $$invalidate(0, item.scoop_status = "green", item); else $$invalidate(0, item.scoop_status = "red", item);
    		SaveItem();
    	}

    	const writable_props = ["item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ActivityRow> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => OnScoopStatusClicked();
    	const click_handler_1 = () => OnJSRawClicked(item);

    	const click_handler_2 = () => {
    		$$invalidate(1, jsRawText = null);
    	};

    	$$self.$$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		SaveItem,
    		item,
    		jsRawText,
    		OnJSRawClicked,
    		OnScoopStatusClicked
    	});

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("jsRawText" in $$props) $$invalidate(1, jsRawText = $$props.jsRawText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		item,
    		jsRawText,
    		OnJSRawClicked,
    		OnScoopStatusClicked,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class ActivityRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { item: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ActivityRow",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console.warn("<ActivityRow> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<ActivityRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<ActivityRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.3 */

    const { Error: Error_1, console: console_1$2 } = globals;
    const file$4 = "src/App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (62:0) {:else}
    function create_else_block$1(ctx) {
    	let appframe;
    	let current;

    	appframe = new AppFrame({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(appframe.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(appframe, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const appframe_changes = {};

    			if (dirty & /*$$scope, promise, searchTerm*/ 2051) {
    				appframe_changes.$$scope = { dirty, ctx };
    			}

    			appframe.$set(appframe_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appframe.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appframe.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(appframe, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(62:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (59:0) {#if !$AuthStore.loggedIn}
    function create_if_block$3(ctx) {
    	let auth;
    	let current;
    	auth = new Auth({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(auth.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(auth, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const auth_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				auth_changes.$$scope = { dirty, ctx };
    			}

    			auth.$set(auth_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(auth.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(auth.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(auth, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(59:0) {#if !$AuthStore.loggedIn}",
    		ctx
    	});

    	return block;
    }

    // (88:1) {:catch error}
    function create_catch_block(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[10].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			attr_dev(p, "class", "svelte-yo50r4");
    			add_location(p, file$4, 88, 2, 1893);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*promise*/ 2 && t_value !== (t_value = /*error*/ ctx[10].message + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(88:1) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (68:1) {:then places}
    function create_then_block(ctx) {
    	let t0_value = /*places*/ ctx[6].Items.length + "";
    	let t0;
    	let t1;
    	let span;
    	let t3;
    	let input;
    	let t4;
    	let table;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*places*/ ctx[6].Items;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" is how may places yo got..,\n\n\t\t");
    			span = element("span");
    			span.textContent = "Search name/tags";
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(span, "margin-left", "100px");
    			set_style(span, "margin-right", "20px");
    			set_style(span, "font-size", "25px");
    			attr_dev(span, "class", "svelte-yo50r4");
    			add_location(span, file$4, 71, 2, 1329);
    			attr_dev(input, "type", "text");
    			set_style(input, "width", "50%");
    			set_style(input, "height", "40px");
    			set_style(input, "font-size", "29px");
    			attr_dev(input, "class", "svelte-yo50r4");
    			add_location(input, file$4, 72, 1, 1422);
    			attr_dev(table, "class", "svelte-yo50r4");
    			add_location(table, file$4, 74, 1, 1516);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*searchTerm*/ ctx[0]);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*promise*/ 2) && t0_value !== (t0_value = /*places*/ ctx[6].Items.length + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*searchTerm*/ 1 && input.value !== /*searchTerm*/ ctx[0]) {
    				set_input_value(input, /*searchTerm*/ ctx[0]);
    			}

    			if (dirty & /*promise, searchTerm*/ 3) {
    				each_value = /*places*/ ctx[6].Items;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(table, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(68:1) {:then places}",
    		ctx
    	});

    	return block;
    }

    // (78:2) {#if ( searchTerm == null || searchTerm.length <=0 ||   item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||   item.types?.filter(t=>t.startsWith(searchTerm)).length>0 )}
    function create_if_block_1$2(ctx) {
    	let activityrow;
    	let current;

    	activityrow = new ActivityRow({
    			props: { item: /*item*/ ctx[7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(activityrow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(activityrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const activityrow_changes = {};
    			if (dirty & /*promise*/ 2) activityrow_changes.item = /*item*/ ctx[7];
    			activityrow.$set(activityrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(activityrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(activityrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(activityrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(78:2) {#if ( searchTerm == null || searchTerm.length <=0 ||   item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||   item.types?.filter(t=>t.startsWith(searchTerm)).length>0 )}",
    		ctx
    	});

    	return block;
    }

    // (77:2) {#each places.Items as item }
    function create_each_block$1(ctx) {
    	let show_if = /*searchTerm*/ ctx[0] == null || /*searchTerm*/ ctx[0].length <= 0 || /*item*/ ctx[7].name.toLowerCase().includes(/*searchTerm*/ ctx[0].toLowerCase()) || /*item*/ ctx[7].types?.filter(/*func*/ ctx[3]).length > 0;
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*searchTerm, promise*/ 3) show_if = /*searchTerm*/ ctx[0] == null || /*searchTerm*/ ctx[0].length <= 0 || /*item*/ ctx[7].name.toLowerCase().includes(/*searchTerm*/ ctx[0].toLowerCase()) || /*item*/ ctx[7].types?.filter(/*func*/ ctx[3]).length > 0;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*searchTerm, promise*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(77:2) {#each places.Items as item }",
    		ctx
    	});

    	return block;
    }

    // (66:17)    WAITING...  {:then places}
    function create_pending_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("WAITING...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(66:17)    WAITING...  {:then places}",
    		ctx
    	});

    	return block;
    }

    // (63:0) <AppFrame>
    function create_default_slot_1(ctx) {
    	let await_block_anchor;
    	let promise_1;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 6,
    		error: 10,
    		blocks: [,,,]
    	};

    	handle_promise(promise_1 = /*promise*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*promise*/ 2 && promise_1 !== (promise_1 = /*promise*/ ctx[1]) && handle_promise(promise_1, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[6] = child_ctx[10] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(63:0) <AppFrame>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*$AuthStore*/ ctx[2].loggedIn) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $AuthStore;
    	validate_store(AuthStore, "AuthStore");
    	component_subscribe($$self, AuthStore, $$value => $$invalidate(2, $AuthStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let searchTerm = null;
    	let promise = null;

    	async function fetchData() {
    		const response = await self.fetch(SERVER_URL + "/places", {
    			method: "get",
    			headers: new Headers({ "Authorization": $AuthStore.key })
    		});

    		if (response.ok) {
    			return response.json();
    		} else {
    			if (response.status == 401) {
    				AuthStore.set({ loggedIn: false });
    			}

    			throw new Error("Something went wrong" + response.statusText);
    		}
    	}

    	AuthStore.subscribe(as => {
    		if (as.loggedIn) {
    			$$invalidate(1, promise = fetchData());

    			promise.then(d => {
    				d.Items.sort((a, b) => {
    					if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
    					if (b.name.toLowerCase() > a.name.toLowerCase()) return -1;
    					return 0;
    				});

    				d.Items[0].scoop_status = "red";

    				//console.log( JSON.stringify(d))
    				console.log(d.Items.length);

    				console.log("LENGTH");
    			});
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const func = t => t.startsWith(searchTerm);

    	function input_input_handler() {
    		searchTerm = this.value;
    		$$invalidate(0, searchTerm);
    	}

    	$$self.$capture_state = () => ({
    		AuthStore,
    		SERVER_URL,
    		Auth,
    		AppFrame,
    		ActivityRow,
    		searchTerm,
    		promise,
    		fetchData,
    		$AuthStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("searchTerm" in $$props) $$invalidate(0, searchTerm = $$props.searchTerm);
    		if ("promise" in $$props) $$invalidate(1, promise = $$props.promise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [searchTerm, promise, $AuthStore, func, input_input_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
