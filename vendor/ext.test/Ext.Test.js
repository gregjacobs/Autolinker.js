/*!
 * Ext.Test
 * GPL Licensed (unfortunately...)
 * 
 * https://github.com/gregjacobs/Ext.test
 */
// Current ExtJs Unit Test are based on YUI 3.1.1
// Thanks to Niko for this
/*global YUI */
var Y = {};
Y.ObjectAssert = {};

YUI().use('*', function(A) {
	// Some hooks
	Y = A;
	Y.ObjectAssert.hasProperty = Y.ObjectAssert.hasKey;
});

// Create Namespace 
Ext.ns('Ext.test');

/**
 * @class Ext.test.TestSuite
 * TestSuite class.
 * @extends Y.Test.Case
 * @author  Nicolas FERRERO (aka yhwh) for Sylogix
 * @version 1.3
 * @date	June 4, 2010
 */
/*global Ext, Y */
Ext.test.TestSuite = Ext.extend( Y.Test.Suite, {
																
	/**
	 * @cfg {String} name (defaults to undefined) The TestSuite name.
	 */
	/**
	 * cfg {Array} items An array of TestCases, TestSuites, or config objects to initially
	 * add to this TestSuite.
	 */
	/**
	 * @cfg {Object} defaults (defaults to {}) The defaults methods or properties 
	 * to apply to children Ext.test.TestCase.
	 */
	 
	defaults: {},
	disableRegister: false,
	constructor: function( config ) {
		Ext.test.TestSuite.superclass.constructor.apply(this, arguments);
		
		this.initItems();
	},
	
	
	/** 
	 * Adds TestCases and/or TestSuites from an initial 'items' config.
	 * @private
	 */
	initItems: function() {
		var tcs = this.items.slice( 0 );
		this.items = [];
		if( tcs ) {
			var len = tcs.length;
			var tc;
			for( var i = 0; i < len; i++ ) {
				tc = tcs[ i ];
				Ext.applyIf( tc, this.defaults );
				this.add( tc );
			}
		}
	},
	
	
	/**
	 * Adds an Ext.test.TestCase or Ext.test.TestSuite to this TestSuite, and
	 * registers it in the Ext.test.Session.
	 * @param {Ext.test.TestCase/Ext.test.TestSuite/Object} item A TestCase, TestSuite, or configuration 
	 * object that represents the TestCase/TestSuite. 
	 */
	add: function( item ) {
		var it = item;
		    it.parentSuite = this;
		
		if ( !( item instanceof Ext.test.TestCase ) && !( item instanceof Ext.test.TestSuite ) ) {
			if (it.ttype == 'testsuite' || it.ttype == 'suite') {
				it = new Ext.test.TestSuite( item );
			} else {
				it = new Ext.test.TestCase( item );
			}
		}
		
		return Ext.test.TestSuite.superclass.add.call( this, it );
	},
	
	
	/**
	 * Adds the TestSuite to a parent TestSuite.
	 * 
	 * @method addTo
	 * @param {Ext.test.TestSuite} parentTestSuite The parent TestSuite to add this TestSuite to.
	 * @return {Ext.test.TestSuite} This TestSuite instance.
	 */
	addTo : function( parentTestSuite ) {
		parentTestSuite.add( this );
		return this;
	},
	
	
	/**
	 * Gets the number of Ext.test.TestSuite's that will be run when this 
	 * Ext.test.TestSuite is run.
	 * @return {Number} The number of TestSuites.
	 */
	getTestSuiteCount: function(){
		var items = this.items,
				len = items.length,
				c = 0,
				it;
				
		for (var i = 0; i < len; i++){
			it = items[i];
			if(it instanceof Ext.test.TestSuite){
					c += it.getTestSuiteCount() + 1;
			}
		}
		return c;
	},
	
	
	/**
	 * Gets the number of Ext.test.TestCase's that will be run when this 
	 * Ext.test.TestSuite is run.
	 * @return {Number} The number of TestCases
	 */
	getTestCaseCount: function(){
		var items = this.items,
				len = items.length,
				c = 0,
				it;
				
		for (var i = 0; i < len; i++){
			it = items[i];
			if (it instanceof Ext.test.TestCase){
				c++;
			} else if (it instanceof Ext.test.TestSuite){
				c += it.getTestCaseCount();
			}
		}
		return c;
	},
	
	
	/**
	 * Cascades down the Ext.test.TestSuite tree from this Ext.test.TestSuite, 
	 * calling the specified function with each item. 
	 * If the function returns false at any point, the cascade is stopped on that branch.
	 * @param {Function} The function to call
	 * @param {Ext.test.TestSuite/Ext.test.TestCase}(optional) The scope (this reference) in which the function is executed. Defaults to the current TestObject.
	 */
	cascade: function( fn, scope ){
		var items = this.items,
				len = items.length,
				it;
				
		scope = scope || this;
		var res = fn.call(scope, this);
		if (res == false) {
			return;
		}
		
		for(var i = 0; i < len; i++){
			it = items[i];
			
			if( it instanceof Ext.test.TestSuite ) {
				res = it.cascade( fn, scope );
				if( res == false ) {
					return;
				}
			
			} else if( it instanceof Ext.test.TestCase ) {
				fn.call( scope, it );
				
				// Loop over the individual Test nodes as well.
				var tests = it.getTests();
				for( var j = 0, numTests = tests.length; j < numTests; j++ ) {
					fn.call( scope, tests[ j ] );
				}
			}
		}
	}
});

// Alias a simpler name
Ext.test.Suite = Ext.test.TestSuite;

// Ext 3.2.1 Unit Tests Compatibility
Y.Test.Suite = Ext.test.TestSuite;

/**
 * @class Ext.test.TestCase
 * TestCase class.
 * @extends Y.Test.Case
 * @author  Nicolas FERRERO (aka yhwh) for Sylogix
 * @version 1.3
 * @date	June 4, 2010
 */
/*global Ext, Y */
Ext.test.TestCase = Ext.extend( Y.Test.Case, {
	/**
	 * @cfg {String} name (defaults to undefined) The TestCase name.
	 */
	
	/**
	 * @cfg {Ext.test.Session} testSession (defaults to Ext.test.Session) The 
	 * default instanciated Ext.test.Session where the Ext.test.TestCase register.
	 */
	constructor: function(config) {
		//Ext.apply(this, config);  -- no need for this, superclass does it
		
		Ext.test.TestCase.superclass.constructor.apply(this, arguments);
	},
	
	
	/**
	 * Adds the TestCase to a parent TestSuite.
	 * 
	 * @method addTo
	 * @param {Ext.test.TestSuite} parentTestSuite The parent TestSuite to add this TestCase to.
	 * @return {Ext.test.TestCase} This TestCase instance.
	 */
	addTo : function( parentTestSuite ) {
		parentTestSuite.add( this );
		return this;
	},
	
	
	/**
	 * @method getTests
	 * Gets the individual tests for this test case. Test functions are marked by starting
	 * with the word 'test', or have the string 'should' in them.
	 *
	 * @return {Ext.test.Test[]}
	 */
	getTests : function() {
		// Loop over the properties of this object, and find the test functions
		var tests = [];
		for( var prop in this ) {
			if( Ext.isFunction( this[ prop ] ) ) {
				
				// If the property name starts with 'test', or has the word 'should' in it, then it is a test function
				if( prop.indexOf( "test" ) === 0 || ( prop.toLowerCase().indexOf( "should" ) > -1 && prop.indexOf( " " ) > -1 ) ) {
					tests.push( new Ext.test.Test( prop, this, this[ prop ] ) );
				}
				
			}
		}
		return tests;
	},
	
	
	/**
	 * Retrieves the parent {@link Ext.test.TestSuite} of the TestCase.
	 * 
	 * @method getParentSuite
	 * @return {Ext.test.TestSuite}
	 */
	getParentSuite : function() {
		return this.parentSuite;
	}
	
});

// Alias a simpler name
Ext.test.Case = Ext.test.TestCase;

// Ext 3.2.1 Unit Tests Compatibility
Y.Test.Case = Ext.test.TestCase;

/**
 * @class Ext.test.Test
 * Simple wrapper class for encapsulating individual tests within a TestCase
 *
 * @param {String} name The name of the test
 * @param {Ext.test.TestCase} testCase The TestCase that this test belongs to.
 * @param {Function} fn The test's function.
 */
/*global Ext */
Ext.test.Test = function( name, testCase, fn ) {
	if( !name || typeof name !== 'string' ) { throw new Error( "'name' arg required for Ext.test.Test constructor" ); }
	if( !(testCase instanceof Ext.test.TestCase) ) { throw new Error( "'testCase' arg for Ext.test.Test constructor must be an Ext.test.TestCase" ); }
	if( typeof fn !== 'function' ) { throw new Error( "'fn' arg for Ext.test.Test constructor must be a function" ); }
	
	this.name = name;
	this.testCase = testCase;
	this.fn = fn;
};

/**
 * @class Ext.test.Session
 * The Test Session Class. 
 * @extends Ext.util.Observable
 * @author  Nicolas FERRERO (aka yhwh) for Sylogix
 * @version 1.3
 * @date	June 4, 2010
 */
/*global Ext */
Ext.test.Session = Ext.extend( Ext.util.Observable, {
	
	// Add some events
	constructor: function( config ) {
		Ext.apply( this, config );
		Ext.test.Session.superclass.constructor.apply(this, arguments);
		
		this.addEvents(
			/**
			 * @event registersuite
			 * Fires after a Ext.test.TestSuite is registered in this Ext.test.Session.
			 * @param {Ext.test.Session} session This Ext.test.Session instanciated object.
			 * @param {Ext.test.TestSuite} tsuite The Ext.test.TestSuite.
			 */
			'registersuite',
			
			/**
			 * @event registercase
			 * Fires after a Ext.test.TestCase is registered in this Ext.test.Session.
			 * @param {Ext.test.Session} session This Ext.test.Session instanciated object.
			 * @param {Ext.test.TestCase} tsuite The Ext.test.TestCase.
			 */
			'registercase'
		);
			
		// Create the master suite
		this.masterSuite = new Ext.test.TestSuite( {
			name: document.title,
			disableRegister: true,
			testSession: this
		} );
	},
	
	
	/**
	 * Convenience for adding a Ext.test.TestSuite to this Ext.test.Session.
	 * 
	 * @method addSuite
	 * @param {String} name (optional) The name of the Ext.test.TestSuite. This may be omitted, and the TestSuite
	 *   provided as the first argument if the TestSuite is to be added to the main suite.
	 * @param {Ext.test.TestSuite/Object} testSuite The TestSuite, or anonymous object that defines the TestSuite.
	 */
	addSuite : function( name, testSuite ) {
		var parentSuite;
		if( typeof name === 'string' ) {
			parentSuite = this.getSuite( name );
		} else {
			// 'name' argument left out, assume name=testSuite
			testSuite = name;
			parentSuite = testSuite.parentSuite || this.masterSuite;
		}
		
		if( !(testSuite instanceof Ext.test.TestSuite) ) {
			// config object, add correct ttype for instantiation
			testSuite.ttype = "testsuite";
		}
		parentSuite.add( testSuite ); 
	},
	
	
	/**
	 * Adds a Ext.test.TestCase to this Ext.test.Session, adding it to a TestSuite. Accepts 
	 * an anonymous object as the TestCase, which will be converted into a TestCase instance.
	 * 
	 * @method addTest
	 * @param {String} name (optional) The name of the parent Ext.test.TestSuite. This may be omitted, and the TestCase
	 *   provided as the first argument if the TestCase is to be added to the main suite. If provided, and the name
	 *   does not yet exist, it will be created.
	 * @param {Ext.test.TestCase/Object} testCase The TestCase, or anonymous object that defines the TestCase.
	 */
	addTest: function( name, testCase ) {
		var parentSuite;
		if( typeof name === 'string' ) {
			parentSuite = this.getSuite( name );
		} else {
			// 'name' argument left out, assume name=testCase
			testCase = name;
			parentSuite = testCase.parentSuite || this.masterSuite;
		}
		parentSuite.add( testCase );
	},
	
	
	/**
	 * Gets an existing Ext.test.TestSuite by name, or create it if it doesn't exist yet.
	 * @param {String} name The name of the Ext.test.TestSuite
	 * @return {Ext.test.TestSuite} The Ext.test.TestSuite
	 */
	getSuite: function(name) {
		var t = this.findSuite(name);
		if (!t) {
			t = this.createSuite(name);
			this.masterSuite.add( t );  // creating a suite, need to add it to the master suite to be shown
		}
		return t;
	},
	
	
	/**
	 * Creates an Ext.test.TestSuite.
	 * @param {String} name The name of the Ext.test.TestSuite
	 * @return {Ext.test.TestSuite} The Ext.test.TestSuite
	 */
	createSuite: function(name) {
		return new Ext.test.TestSuite( {
			name: name
		} );
	},
	
	
	/**
	 * Finds an Ext.test.TestSuite by name.
	 * @param {String} name The name of the Ext.test.TestSuite
	 * @return {Ext.test.TestSuite} The Ext.test.TestSuite, or null if the TestSuite is not registered.
	 */
	findSuite: function( name ) {
		var tsuite;
		this.masterSuite.cascade( function(t){
			if (t instanceof Ext.test.TestSuite && t.name == name){
				tsuite = t;
				return false;
			}
		},this );
		return tsuite;
	},
	
	
	/**
	 * Registers an Ext.test.TestSuite into this session.
	 * @param {Ext.test.TestSuite} testSuite The TestSuite to register.
	 */
	registerSuite: function(testSuite) {
		this.masterSuite.add( testSuite );
		this.fireEvent( 'registersuite', this, testSuite );
	},
	
	
	/**
	 * Registers an Ext.test.TestCase into this session.
	 * @param {Ext.test.TestCase} testCase The TestCase to register.
	 */
	registerCase: function( testCase ) {
		this.masterSuite.add( testCase );
		this.fireEvent( 'registercase', this, testCase );
	},
	
	
	/**
	 * Finds an Ext.test.TestCase by name.
	 * @param {String} name The name of the Ext.test.TestCase 
	 * @return {Ext.test.TestCase} The Ext.test.TestCase, or null if the TestCase is not registered.
	 */
	findCase: function(name) {
		var tcase;
		this.masterSuite.cascade( function(t){
			if (t instanceof Ext.test.TestCase && t.name == name){
				tcase = t;
				return false;
			}
		}, this );
		return tcase;
	},
	
	
	/**
	 * Gets the number of registered Ext.test.TestCase's in this Ext.test.Session.
	 * @return {Number} The number of TestCases.
	 */
	getTestCaseCount: function() {
		return this.masterSuite.getTestCaseCount();
	},
	
	
	/**
	 * Gets the number of registered Ext.test.TestSuite's in this Ext.test.Session.
	 * @return {Number} The number of TestSuites.
	 */
	getTestSuiteCount: function() {
		return this.masterSuite.getTestSuiteCount();
	},
	
		
	/**
	 * Gets the Ext.test.Session MasterSuite.
	 * @return {Ext.test.TestSuite} The Masteer Ext.test.TestSuite.
	 */
	getMasterSuite: function(){
		return this.masterSuite;
	},
	
	
	/**
	 * Destroys the Ext.test.Session.
	 */
	destroy: function(){
		this.purgeListeners();
	}
	
});

// A little hack to maintain the constructor for tests
Ext.test.SessionImpl = Ext.test.Session;

// Overwrite with static instance (to make a singleton)
Ext.test.Session = new Ext.test.Session();

/**
 * @class Ext.test.Runner
 * An Observable that manage the YUI Test Runner
 * @extends Ext.util.Observable
 * @author  Nicolas FERRERO (aka yhwh) for Sylogix
 * @version 1.3
 * @date	June 4, 2010
 */
/*global Ext, Y */
Ext.test.Runner = Ext.extend( Ext.util.Observable, {
  /**
	 * @cfg {Ext.test.Session} testSession (defaults to Ext.test.session) The 
	 * default instanciated Ext.test.Session used by this Ext.test.Runner.
	 */
	
	testSession: Ext.test.Session,
	constructor: function() {
		Ext.test.Runner.superclass.constructor.apply(this, arguments);
		
		this.addEvents(
			/**
			 * @event beforebegin
			 * Fires before the test runner begins.
			 * @param {Ext.test.Runner} runner This Ext.test.Runner object.
			 * @param {Object} event The runner event.
			 */
			'beforebegin',
			
			/**
			 * @event begin
			 * Fires when the test runner begins.
			 * @param {Ext.test.Runner} runner This Ext.test.Runner object.
			 * @param {Object} event The runner event.
			 */
			'begin',
			
			/**
			 * @event complete
			 * Fires when the test runner has finished.
			 * @param {Ext.test.Runner} runner This Ext.test.Runner object.
			 * @param {Object} event The runner event.
			 */
			'complete',
			
			/**
			 * @event pass
			 * Fires when a test passes.
			 * @param {Ext.test.Runner} runner This Ext.test.Runner object.
			 * @param {Object} event The runner event.
			 */
			'pass',
			
			/**
			 * @event fail
			 * Fires when a test fails.
			 * @param {Ext.test.Runner} runner This Ext.test.Runner object.
			 * @param {Object} event The runner event.
			 */
			'fail',
			
			/**
			 * @event ignore
			 * Fires when a test is ignored.
			 * @param {Ext.test.Runner} runner This Ext.test.Runner object.
			 * @param {Object} event The runner event.
			 */
			'ignore',
			
			/**
			 * @event testcasebegin
			 * Fires when a TestCase begins.
			 * @param {Ext.test.Runner} runner This Ext.test.Runner object.
			 * @param {Object} event The runner event.
			 */
			'testcasebegin',
			
			/**
			 * @event testcasecomplete
			 * Fires when a TestCase has finished.
			 * @param {Ext.test.Runner} runner This Ext.test.Runner object.
			 * @param {Object} event The runner event.
			 */
			'testcasecomplete',
			
			/**
			 * @event testsuitebegin
			 * Fires when a TestSuite begins.
			 * @param {Ext.test.Runner} runner This Ext.test.Runner object.
			 * @param {Object} event The runner event.
			 */
			'testsuitebegin',
			
			/**
			 * @event testsuitecomplete
			 * Fires when a TestSuite has finished.
			 * @param {Ext.test.Runner} runner This Ext.test.Runner object.
			 * @param {Object} event The runner event.
			 */
			'testsuitecomplete'
		);
		this.monitorYUITestRunner();
	},
	
	
	// YUI TestRunner events
	monitorYUITestRunner: function() {
			var r = Y.Test.Runner;
			r.disableLogging();
			var fn = this.onTestRunnerEvent;
			r.subscribe("begin", fn, this, true);
			r.subscribe("complete", fn, this, true);
			r.subscribe("fail", fn, this, true);
			r.subscribe("ignore", fn, this, true);
			r.subscribe("pass", fn, this, true);
			r.subscribe("testcasebegin", fn, this, true);
			r.subscribe("testcasecomplete", fn, this, true);
			r.subscribe("testsuitebegin", fn, this, true);
			r.subscribe("testsuitecomplete", fn, this, true);
			this.runner = r;
	},
	
	// handle YUI TestRunner events
	onTestRunnerEvent: function(e) {
			var type = e.type;
			// Master Suite event drop
			if (type == 'testsuitebegin' && e.testSuite.name == this.runner.getName()){
					return;
			}
			this.fireEvent(type, this, e);
	},
	
	/**
	 * Runs registered testCases and testSuites.
	 */
	run: function() {
			this.fireEvent('beforebegin', this);
			var master_suite = this.testSession.getMasterSuite();
			this.runner.add(master_suite);
			this.runner.run(true);
	},
	
	/**
	 * Removes all test objects. 
	 */
	clear: function(){
		this.runner.clear();
	},
	
	/**
	 * Unsubscribe runner events and purge all listeners in Ext.test.Runner. 
	 */
	destroy: function() {
		this.runner.unsubscribeAll();
		this.purgeListeners();
	}
} );

// Overwrite class with static (singleton) instance
Ext.test.Runner = new Ext.test.Runner();

// Create Namespace 
Ext.ns('Ext.test.view');

/**
 * @class Ext.test.view.Logger
 * A Console that show Ext.test.Runner events.
 * @extends Ext.grid.GridPanel
 * @author  Nicolas FERRERO (aka yhwh) for Sylogix
 * @version 1.3
 * @date	June 4, 2010
 */
Ext.test.view.Logger = Ext.extend(Ext.grid.GridPanel, {
    autoWidth: true,
    viewConfig: {
        forceFit: true
    },
    cls: 'x-test-logger',
    disableSelection: true,
    trackMouseOver: false,
    initComponent: function() {
        this.configureStore();
        this.configureColumns();
        this.monitorTestRunner();
        Ext.test.view.Logger.superclass.initComponent.apply(this, arguments);
    },
    // store config
    configureStore: function(){
        this.store = new Ext.data.JsonStore({
            fields: ['logs', 'state']
        });
    },
    // default column and his renderer
    configureColumns: function(){
        this.columns = [{
            header: 'Logs',
            dataIndex: 'logs',
            renderer: function(value, cell, record) {
                return '<span class="x-test-logger-state-' + record.get('state') + '">' + value + '</span>';
            }
        }];
    },
    // monitor test runner events
    monitorTestRunner: function(){
        var fn = this.onTestRunnerEvent;
        var r = Ext.test.Runner;
        this.mon(r, 'begin', fn, this);
        this.mon(r, 'complete', fn, this);
        this.mon(r, 'fail', fn, this);
        this.mon(r, 'pass', fn, this);
        this.mon(r, 'ignore', fn, this);
        this.mon(r, 'testcasebegin', fn, this);
        this.mon(r, 'testcasecomplete', fn, this);
        this.mon(r, 'testsuitebegin', fn, this);
        this.mon(r, 'testsuitecomplete', fn, this);
    },
    // add records on each runner events
    onTestRunnerEvent: function(r, e) {
        var logs;
        switch (e.type) {
        case 'begin':
            logs = "Begin at " + new Date();
            break;
        case 'complete':
            logs = "Completed at " + new Date();
            break;
        case 'testcasebegin':
            logs = 'TestCase ' + e.testCase.name + ' : Begin.';
            break;
        case 'testcasecomplete':
            logs = 'TestCase ' + e.testCase.name + ' : Complete.';
            break;
        case 'testsuitebegin':
            logs = 'TestSuite ' + e.testSuite.name + ' : Begin.';
            break;
        case 'testsuitecomplete':
            logs = 'TestSuite ' + e.testSuite.name + ' : Complete.';
            break;
        case 'pass':
            logs = e.testName + ' : Passed.';
            break;
        case 'fail':
            logs = e.testName + ' : Failed! <br />' + e.error.toString();
            break;
        case 'ignore':
            logs = e.testName + ' : Ignored.';
            break;
        }
        if (logs) {
            this.store.add(new Ext.data.Record({
                logs: logs,
                state: e.type
            }));
        }
    }
});
Ext.reg('testlogger', Ext.test.view.Logger);

/**
 * @class Ext.test.view.ColumnTree
 * A ColumnTree that show test registered in Ext.test.Session. 
 * Based on Ext.ux.tree.ColumnTree sample.
 * @extends Ext.tree.TreePanel
 * @author  Nicolas FERRERO (aka yhwh) for Sylogix
 * @version 1.3
 * @date	June 4, 2010
 */
/*global Ext */
Ext.test.view.ColumnTree = Ext.extend(Ext.tree.TreePanel, {
	
	// This ColumnTree's configs
	useArrows: true,
	//header: true,	Note: causes error in Ext 3.1.1
	passText: 'Passed',
	failText: 'Failed!',
	ignoreText: '(Ignored)',
	autoScroll: true,
	rootVisible: false,
	lines : false,
	
	borderWidth : Ext.isBorderBox ? 0 : 2, // the combined left/right border for each cell
	cls : 'x-column-tree',
	
	
	initComponent: function() {
		
		Ext.apply( this, Ext.apply( this.initialConfig, {
			root: new Ext.tree.TreeNode( {
				expanded: true
			} ),
			
			columns: [
				{
					dataIndex: 'name',
					header: 'Name',
					id: 'name',
					width: 500,
					renderer: function(val, node) {
						var qtip = '';
						var err = node.attributes['errors'];
						if (err != '') {
								qtip = 'ext:qtip="' + err + '"';
						}
						return '<span '+qtip+'>' + val + '</span>';
					}
				},{
					dataIndex: 'state',
					header: 'State',
					id: 'state',
					renderer: function(val, node) {
						var color = '#000';
						if (val == node.ownerTree.passText) {
								color = "#00FF00";
						} else if (val == node.ownerTree.failText) {
								color = '#FF0000';
						}
						return '<span style="color: ' + color + ';font-weight: bold;">' + val + '</span>';
					},
					width: 75
				}, 
				{ dataIndex: 'passed', header: 'Passed', width: 50 }, 
				{ dataIndex: 'failed', header: 'Failed', width: 50 }, 
				{ dataIndex: 'ignored', header: 'Ignored', width: 50 }, 
				{ dataIndex: 'message', header: 'Message', width: 800 }
			]
		} ) );  // eo apply config
		
		
		// Monitor the test runner
		var fn = this.onTestRunnerEvent;
		var runner = Ext.test.Runner;
		this.mon( runner, 'begin', fn, this );
		this.mon( runner, 'complete', fn, this );
		this.mon( runner, 'fail', fn, this );
		this.mon( runner, 'pass', fn, this );
		this.mon( runner, 'ignore', fn, this );
		this.mon( runner, 'testcasebegin', fn, this );
		this.mon( runner, 'testcasecomplete', fn, this );
		this.mon( runner, 'testsuitebegin', fn, this );
		this.mon( runner, 'testsuitecomplete', fn, this );
		this.mon( runner, 'beforebegin', this.resetNodes, this );
		
		// Call the superclass initComponent
		Ext.test.view.ColumnTree.superclass.initComponent.apply( this, arguments );
	},
	
	
	// See columnTree example for this
	onRender: function() {
		Ext.test.view.ColumnTree.superclass.onRender.apply(this, arguments);
		
		this.colheaders = this.bwrap.createChild( {
			cls: 'x-tree-headers'
		}, this.bwrap.dom.lastChild );
		
		var cols = this.columns,
		    c;
		for (var i = 0, len = cols.length; i < len; i++) {
			c = cols[i];
			this.colheaders.createChild({
				cls: 'x-tree-hd ' + (c.cls ? c.cls + '-hd': ''),
				cn: {
					cls: 'x-tree-hd-text',
					html: c.header
				},
				style: 'width:' + (c.width - this.borderWidth) + 'px;'
			});
		}
		this.colheaders.createChild({
			cls: 'x-clear'
		});
		
		// prevent floats from wrapping when clipped
		this.colheaders.setWidth( 'auto' );
		this.createTree();
	},
	
	
	// private create tree for Ext.test.Session
	createTree: function() {
		var ms = Ext.test.Session.getMasterSuite();
		
		ms.cascade( function( t ) {
			if( t === ms ) { 
				this.addSuiteNode( ms, this.root, true );
				
			} else if(!t.parentSuite){
				if( t instanceof Ext.test.TestSuite ) {
					this.addSuiteNode(t);
				} else if(t instanceof Ext.test.TestCase){
					this.addCaseNode(t);
				} else {
					// Individual tests
					var caseNode = this.getCaseNode( t.testCase );
					this.addTestNode(t,caseNode);
				}
				
			} else {
				var sn = this.getSuiteNode(t.parentSuite);
				if (t instanceof Ext.test.TestCase){
					this.addCaseNode(t,sn);
				} else {
					this.addSuiteNode(t,sn);
				}
			}
		}, this);
	},
	
	
	
	// private reset TreeNode attributes before a run
	resetNodes: function() {
		var attr, ui;
		this.root.cascade( function(node) {
			if (node != this.root) {
				attr = node.attributes;
				ui = node.ui;
				attr['passed'] = '';
				attr['failed'] = '';
				attr['ignored'] = '';
				attr['errors'] = '';
				attr['state'] = '';
				attr['message'] = '';
				//if( attr['type'] == 'testSuite' ) {
					ui.setIconElClass('x-tree-node-icon');
				//}
				ui.refresh();
			}
		}, this );
	},
	
		
	/**
	 * Creates an Ext.test.TestSuite node.
	 * @param {Ext.test.TestSuite} ts The TestSuite
	 * @return {Ext.tree.TreeNode} The Ext.tree.TreeNode
	 */
	createSuiteNode: function(ts, expanded) {
		return new Ext.tree.TreeNode( {
			name: ts.name,
			testSuite: ts,
			uiProvider: Ext.test.view.uiProvider,
			type: 'testSuite',
			expanded: expanded,
			state: '',
			passed: '',
			failed: '',
			ignored: '',
			errors: '',
			message: ''
		} );
	},
	
	
	/**
	 * Creates an Ext.test.TestSuite node and adds it to a parent Ext.tree.TreeNode.
	 * @param {Ext.test.TestSuite} ts The Ext.test.TestSuite
	 * @param {Ext.tree.TreeNode} pnode The parent node
	 */
	addSuiteNode: function(ts, pnode, expanded) {
		pnode = pnode || this.root;
		var oldn = this.getSuiteNode(ts);
		if (oldn) {
			oldn.remove(true);
		}
		var n = this.createSuiteNode(ts, expanded);
		pnode.appendChild(n);
	},
	
		
	/**
	 * Creates an Ext.test.TestCaseNode.
	 * @param {Ext.test.TestCase} tc The TestCase
	 * @return {Ext.tree.TreeNode} The Ext.tree.TreeNode
	 */
	createCaseNode: function( tc ) {
		return new Ext.tree.TreeNode( {
			name: tc.name,
			testCase: tc,
			uiProvider: Ext.test.view.uiProvider,
			type: 'testCase',
			state: '',
			passed: '',
			failed: '',
			ignored: '',
			errors: '',
			message: ''
		} );
	},
	
		
	/**
	 * Creates an Ext.test.TestCase node and adds it to a parent Ext.tree.TreeNode.
	 * @param {Ext.test.TestCase} ts The Ext.test.TestCase
	 * @param {Ext.tree.TreeNode} pnode The parent Ext.tree.TreeNode
	 */
	addCaseNode: function(tc, pnode) {
		pnode = pnode || this.root;
		var n = this.createCaseNode(tc);
		pnode.appendChild(n);
	},
		
		
	/**
	 * Creates a Tree Node for an individual Test
	 * @param {Ext.test.Test} t The Test object
	 * @return {Ext.tree.TreeNode} The Ext.tree.TreeNode
	 */
	createTestNode: function( t ) {
		return new Ext.tree.TreeNode( {
			name: t.name,
			test: t,
			uiProvider: Ext.test.view.uiProvider,
			type: 'test',
			state: '',
			passed: '',
			failed: '',
			ignored: '',
			errors: '',
			message: ''
		} );
	},
	
		
	/**
	 * Creates an Ext.test.TestCase node and adds it to a parent Ext.tree.TreeNode.
	 * @param {Ext.test.TestCase} ts The Ext.test.TestCase
	 * @param {Ext.tree.TreeNode} pnode The parent Ext.tree.TreeNode
	 */
	addTestNode: function(tc, pnode) {
		pnode = pnode || this.root;
		var n = this.createTestNode(tc);
		pnode.appendChild(n);
	},
	
	
	// -----------------------------
	
	
	/**
	 * Gets a TestSuite node by its name.
	 * @param {Ext.test.TestSuite} testSuite The TestSuite
	 * @return {Ext.tree.TreeNode} The Ext.tree.TreeNode, or undefined
	 */
	getSuiteNode: function( testSuite ) {
		// NOTE: Optimization causes an error... for whatever reason
		//if( testSuite.__treeNode ) {
		//	return testSuite.__treeNode;
			
		//} else {
			var n;
			this.root.cascade( function(node) {
				if( node.attributes.testSuite === testSuite ) {
					n = node;
					return false;
				}
			}, this );
			
			// Store the node on the TestSuite object itself, so we don't have to do the cascade
			// again for other events
		//	testSuite.__treeNode = n;
			return n;
		//}
	},
	
	
	/**
	 * Gets an Ext.test.TestCase node by its name.
	 * @param {Ext.test.TestCase} testCase The TestCase
	 * @return {Ext.tree.TreeNode} The node, or undefined.
	 */
	getCaseNode: function( testCase ) {
		// NOTE: Optimization causes an error... for whatever reason
		//if( testCase.__treeNode ) {
		//	return testCase.__treeNode;
			
		//} else {
			var n;
			this.root.cascade( function(node) {
				if( node.attributes.testCase === testCase ) {
					n = node;
					return false;
				}
			}, this );
			
			// Store the node on the TestCase object itself, so we don't have to do the cascade
			// again for other events
		//	testCase.__treeNode = n;
			return n;
		//}
	},
	
	
	/**
	 * Gets an Ext.test.Test node by its name.
	 * @param {Ext.tree.TreeNode} caseNode The Ext.tree.TreeNode for the TestCase that encapsulated the test to search for.
	 * @param {String} name The name of the Ext.test.Test
	 * @return {Ext.tree.TreeNode} The node, or undefined.
	 */
	getTestNode: function(caseNode, name) {
		/*if( !caseNode.__tests ) {
			caseNode.__tests = {};
		}
		
		if( caseNode.__tests[ name ] ) {
			return caseNode.__tests[ name ];
			
		} else {
			var n;
			caseNode.cascade( function( node ) {
				var attr = node.attributes;
				if( attr.type == 'test' && attr.name === name ) {
					n = node;
					return false;
				}
			}, this );
			
			// Store the node on the caseNode object itself, so we don't have to do the cascade
			// again for other events
			caseNode.__tests[ name ] = n;
			return n;
		}*/
		
		var n;
		caseNode.cascade( function( node ) {
			var attr = node.attributes;
			if( attr.type == 'test' && attr.name === name ) {
				n = node;
				return false;
			}
		}, this );
		return n;
	},
	
	
	// private handle test runner events
	onTestRunnerEvent: function(runner, event) {
		var node, caseNode, res;

		switch( event.type ) {
			case "fail":
				caseNode = this.getCaseNode(event.testCase);
				caseNode.attributes['state'] = this.failText;
				caseNode.ui.setIconElClass('testcase-failed');
				caseNode.attributes['errors'] = event.error.getMessage();
				caseNode.ui.refresh();
				
				node = this.getTestNode( caseNode, event.testName );
				node.attributes['state'] = this.failText;
				node.ui.setIconElClass('testcase-failed');
				node.attributes['errors'] = event.error.getMessage();
				node.attributes['message'] = event.error.getMessage();
				node.ui.refresh();
				break;
				
			case "pass":
				caseNode = this.getCaseNode(event.testCase);				
				node = this.getTestNode( caseNode, event.testName );
				node.attributes['state'] = this.passText;
				node.ui.setIconElClass('testcase-passed');
				node.ui.refresh();
				break;
				
			case "ignore":
				caseNode = this.getCaseNode(event.testCase);				
				node = this.getTestNode( caseNode, event.testName );
				node.attributes['state'] = this.ignoreText;
				//node.ui.setIconElClass('testcase-passed');
				node.ui.refresh();
				break;
				
			case "testcasebegin":
				node = this.getCaseNode(event.testCase);
				node.attributes['state'] = 'Running...';
					node.ui.setIconElClass('testcase-running');
				node.ui.refresh();
				break;
			case "testcasecomplete":
				node = this.getCaseNode(event.testCase);
				res = event.results;
				if (res.failed === 0) {
					node.attributes['state'] = this.passText;
					node.ui.setIconElClass('testcase-passed');
				}
				node.attributes['passed'] = res.passed;
				node.attributes['failed'] = res.failed;
				node.attributes['ignored'] = res.ignored;
				node.ui.refresh();
				break;
			case "testsuitebegin":
				node = this.getSuiteNode(event.testSuite);
				node.ui.setIconElClass('testsuite-running');
				node.ui.refresh();
				break;
			case "testsuitecomplete":
				node = this.getSuiteNode(event.testSuite);
				res = event.results;
				if (res.failed === 0) {
						node.attributes['state'] = this.passText;
						node.ui.setIconElClass('testsuite-passed');
				}
				if (res.failed > 0) {
						node.attributes['state'] = this.failText;
						node.ui.setIconElClass('testsuite-failed');
				}
				node.attributes['passed'] = res.passed;
				node.attributes['failed'] = res.failed;
				node.attributes['ignored'] = res.ignored;
				node.ui.refresh();
				break;
		}
	}
	
});

Ext.reg('testtree', Ext.test.view.ColumnTree);

/**
 * @class Ext.test.view.ProgressBar 
 * A progress bar that shows the state of the Ext.test.TestRunner.
 * @extends Ext.ProgressBar
 * @author  Nicolas FERRERO (aka yhwh) for Sylogix
 * @version 1.3
 * @date	June 4, 2010
 */
Ext.test.view.ProgressBar = Ext.extend(Ext.ProgressBar,{
    // the number of test cases already run
    testCaseCount: 0,
    initComponent: function() {
        this.monitorTestRunner();
        Ext.test.view.ProgressBar.superclass.initComponent.apply(this, arguments);
    },
    // monitor runner
    monitorTestRunner: function() {
        this.mon(Ext.test.Runner, 'begin', this.onBegin, this);
        this.mon(Ext.test.Runner, 'testcasecomplete', this.onTestCaseComplete, this);
        this.mon(Ext.test.Runner, 'testsuitecomplete', this.onTestSuiteComplete, this);
        this.mon(Ext.test.Runner, 'complete', this.onComplete, this);
    },
    onBegin: function() {
        this.testCaseCount = 0;
    },
    onTestCaseComplete: function() {
        this.testCaseCount++;
    },
    // update progress bar after each test suite run
    onTestSuiteComplete: function() {
        var count = Ext.test.Session.getTestCaseCount();
        var c = this.testCaseCount / count;
        this.updateProgress(c, Math.round(100 * c) + '% completed...')
    },
    // force ending
    onComplete: function() {
        this.updateProgress(1, '100% completed...');
    }
});
Ext.reg('testprogressbar', Ext.test.view.ProgressBar);

/**
 * @class Ext.test.view.StartButton
 * A Button that run Ext.test.Runner.
 * @extends Ext.Button
 * @author  Nicolas FERRERO (aka yhwh) for Sylogix
 * @version 1.3
 * @date	June 4, 2010
 */
Ext.test.view.StartButton = Ext.extend(Ext.Button,{
    text: 'Re-run', // 'Start',  Because the tests will be run immediately when the page is loaded, I changed the text of this button.
    iconCls: 'x-tbar-page-next',
    initComponent: function() {
        this.setHandler(this.runTests, this);
        this.monitorTestRunner();
        Ext.test.view.StartButton.superclass.initComponent.apply(this,arguments);
    },
    runTests: function() {
        this.disable();
        Ext.test.Runner.run();
    },
    monitorTestRunner: function() {
        this.mon(Ext.test.Runner, 'complete', this.enable, this);
    }
});
Ext.reg('teststartbutton', Ext.test.view.StartButton);

/**
 * @class Ext.test.view.uiProvider
 * A ColumnNodeUI with refresh support and icon changing capability.
 * Based Ext.ux.tree.ColumnNodeUI ExtJS 3.2.1 sample.
 * @extends Ext.tree.TreeNodeUI
 * @author  Nicolas FERRERO (aka yhwh) for Sylogix
 * @version 1.3
 * @date	June 4, 2010
 */
Ext.test.view.uiProvider = Ext.extend(Ext.tree.TreeNodeUI, {
    focus: Ext.emptyFn, // prevent odd scrolling behavior

    renderElements : function(n, a, targetNode, bulkRender){
        this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';

        var t = n.getOwnerTree();
        var cols = t.columns;
        var bw = t.borderWidth;
        var c = cols[0];

        var buf = [
             '<li class="x-tree-node"><div ext:tree-node-id="',n.id,'" class="x-tree-node-el x-tree-node-leaf ', a.cls,'">',
                '<div class="x-tree-col" style="width:',c.width-bw,'px;">',
                    '<span class="x-tree-node-indent">',this.indentMarkup,"</span>",
                    '<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow">',
                    '<img src="', a.icon || this.emptyIcon, '" class="',(a.icon ? " x-tree-node-inline-icon" : ""),(a.iconCls ? " "+a.iconCls : "x-tree-node-icon"),'" unselectable="on">',
                    '<a hidefocus="on" class="x-tree-node-anchor" href="',a.href ? a.href : "#",'" tabIndex="1" ',
                    a.hrefTarget ? ' target="'+a.hrefTarget+'"' : "", '>',
                    '<span unselectable="on">', n.text || (c.renderer ? c.renderer(a[c.dataIndex], n, a) : a[c.dataIndex]),"</span></a>",
                "</div>"];
         for(var i = 1, len = cols.length; i < len; i++){
             c = cols[i];

             buf.push('<div class="x-tree-col ',(c.cls?c.cls:''),'" style="width:',c.width-bw,'px;">',
                        '<div class="x-tree-col-text">',(c.renderer ? c.renderer(a[c.dataIndex], n, a) : a[c.dataIndex]),"</div>",
                      "</div>");
         }
         buf.push(
            '<div class="x-clear"></div></div>',
            '<ul class="x-tree-node-ct" style="display:none;"></ul>',
            "</li>");

        if(bulkRender !== true && n.nextSibling && n.nextSibling.ui.getEl()){
            this.wrap = Ext.DomHelper.insertHtml("beforeBegin",
                                n.nextSibling.ui.getEl(), buf.join(""));
        }else{
            this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf.join(""));
        }

        this.elNode = this.wrap.childNodes[0];
        this.ctNode = this.wrap.childNodes[1];
        var cs = this.elNode.firstChild.childNodes;
        this.indentNode = cs[0];
        this.ecNode = cs[1];
        this.iconNode = cs[2];

        this.anchor = cs[3];
        this.textNode = cs[3].firstChild;
    },
  /**
	 * Refreshes the node's HTML element.
   */
    refresh: function() {
        var n = this.node;
        if (!n.rendered) {
            return;
        }
        var t = n.getOwnerTree();
        var a = n.attributes;
        var cols = t.columns;
        var el = n.ui.getEl().firstChild;
        var cells = el.childNodes;
        for (var i = 1, len = cols.length; i < len; i++) {
            var d = cols[i].dataIndex;
            var v = (a[d] != null) ? a[d] : '';
            if (cols[i].renderer) {
                v = cols[i].renderer(v, n);
            }
            cells[i].firstChild.innerHTML = v;
        }
    },
	/**
	 * Sets the node's CSS icon class.
	 * @param {String} className The name of the CSS class.
	 */
    setIconElClass: function(className) {
			var n = this.node;
			if (!n.rendered) {
				n.attributes.iconCls = className;
				return;
			}
			var iconEl = this.getIconEl();
			iconEl.className = className;
    }
});

