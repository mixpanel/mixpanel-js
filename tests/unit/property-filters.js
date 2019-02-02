import { expect } from 'chai';
import {
    EVENT_PROPERTY,
    LITERAL_PROPERTY,
    AND_OPERATOR,
    OR_OPERATOR,
    IN_OPERATOR,
    NOT_IN_OPERATOR,
    PLUS_OPERATOR,
    MINUS_OPERATOR,
    MUL_OPERATOR,
    DIV_OPERATOR,
    MOD_OPERATOR,
    EQUALS_OPERATOR,
    NOT_EQUALS_OPERATOR,
    GREATER_OPERATOR,
    LESS_OPERATOR,
    GREATER_EQUAL_OPERATOR,
    LESS_EQUAL_OPERATOR,
    BOOLEAN_OPERATOR,
    DATETIME_OPERATOR,
    LIST_OPERATOR,
    NUMBER_OPERATOR,
    STRING_OPERATOR,
    NOT_OPERATOR,
    DEFINED_OPERATOR,
    NOT_DEFINED_OPERATOR,
    evaluateNumber,
    evaluateBoolean,
    evaluateDateTime,
    evaluateList,
    evaluateString,
    evaluateAnd,
    evaluateOr,
    evaluateIn,
    evaluatePlus,
    evaluateArithmetic,
    evaluateEquality,
    evaluateComparison,
    evaluateDefined,
    evaluateNot,
    evaluateOperator,
    evaluateWindow,
    evaluateOperand,
    evaluateSelector
} from '../../src/property-filters';
import {_} from '../../src/utils';
import sinon from 'sinon';

describe(`property-filters`, function() {
    describe(`typecasting operations: `, function() {
        describe(`toNumber`, function(){
            it(`should throw on invalid input`, function() {
                // empty input
                expect(() => evaluateNumber({}, {})).to.throw('Invalid cast operator: number');
                // invalid operator type
                expect(() => evaluateNumber({'operator': DEFINED_OPERATOR, 'children': [{'literal': 1}]}, {})).to.throw('Invalid cast operator: number');
                // invalid number of children
                expect(() => evaluateNumber({'operator': NUMBER_OPERATOR, 'children': [{'literal': 1}, {'literal': 2}]}, {})).to.throw('Invalid cast operator: number');
            });
            it(`should return null when property is missing`, function() {
                var op = {
                    'operator': NUMBER_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$platform'
                    }]
                };
                expect(evaluateNumber(op, {})).to.null;
            });
            it(`should return date.getTime() when casting date`, function() {
                var op = {
                    'operator': NUMBER_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$created_at'
                    }]
                };
                expect(evaluateNumber(op, {'$created_at': new Date(123)})).to.equal(123);
            });
            it(`should return null when casting objects`, function() {
                var op = {
                    'operator': NUMBER_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$created_at'
                    }]
                };
                expect(evaluateNumber(op, {'$created_at': {}})).to.null;
            });
            it(`should return 1 when casting true`, function() {
                var op = {
                    'operator': NUMBER_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': 'bool_true'
                    }]
                };
                expect(evaluateNumber(op, {'bool_true': true})).to.equal(1);
            });
            it(`should return 0 when casting false`, function() {
                var op = {
                    'operator': NUMBER_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': 'bool_false'
                    }]
                };
                expect(evaluateNumber(op, {'bool_false': false})).to.equal(0);
            });
            it(`should return the number`, function() {
                var op = {
                    'operator': NUMBER_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': 'number'
                    }]
                };
                expect(evaluateNumber(op, {'number': 100})).to.equal(100);
            });
            it(`should return number when casting valid numeric string`, function() {
                var op = {
                    'operator': NUMBER_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': 'string_prop'
                    }]
                };
                expect(evaluateNumber(op, {'string_prop': '100'})).to.equal(100);
            });
            it(`should return 0 when casting invalid string`, function() {
                var op = {
                    'operator': NUMBER_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': 'string_prop'
                    }]
                };
                expect(evaluateNumber(op, {'string_prop': 'abc'})).to.equal(0);
            });
        });
        describe(`toBoolean`, function() {
            it(`should throw on invalid input`, function() {
                // empty input
                expect(() => evaluateBoolean({}, {})).to.throw('Invalid cast operator: boolean');
                // invalid operator type
                expect(() => evaluateBoolean({'operator': DEFINED_OPERATOR, 'children': [{'literal': 1}]}, {})).to.throw('Invalid cast operator: boolean');
                // invalid number of children
                expect(() => evaluateBoolean({'operator': BOOLEAN_OPERATOR, 'children': [{'literal': 1}, {'literal': 2}]}, {})).to.throw('Invalid cast operator: boolean');
            });
            it(`should return false when property is missing`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$platform'
                    }]
                };
                expect(evaluateBoolean(op, {})).to.false;
            });
            it(`should return true when property is true`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': 'bool_true'
                    }]
                };
                expect(evaluateBoolean(op, {'bool_true': true})).to.true;
            });
            it(`should return false when property is false`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': 'bool_false'
                    }]
                };
                expect(evaluateBoolean(op, {'bool_false': false})).to.false;
            });
            it(`should return true when property is a number !== 0`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$number'
                    }]
                };
                expect(evaluateBoolean(op, {'$number': -1})).to.true;
            });
            it(`should return false when property is a number === 0`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$number'
                    }]
                };
                expect(evaluateBoolean(op, {'$number': 0})).to.false;
            });
            it(`should return false when property is a empty string`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$string'
                    }]
                };
                expect(evaluateBoolean(op, {'$string': ''})).to.false;
            });
            it(`should return true when property is a non-empty string`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$string'
                    }]
                };
                expect(evaluateBoolean(op, {'$string': 'ab'})).to.true;
            });
            it(`should return true when property is a non-empty array`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$array'
                    }]
                };
                expect(evaluateBoolean(op, {'$array': [1,2]})).to.true;
            });
            it(`should return false when property is an empty array`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$array'
                    }]
                };
                expect(evaluateBoolean(op, {'$array': []})).to.false;
            });
            it(`should return true when property is a non-empty object`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$obj'
                    }]
                };
                expect(evaluateBoolean(op, {'$obj': {1:2}})).to.true;
            });
            it(`should return false when property is an empty obj`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$obj'
                    }]
                };
                expect(evaluateBoolean(op, {'$obj': {}})).to.false;
            });
            it(`should return true when property is a date object with date.getTime() > 0`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$date'
                    }]
                };
                expect(evaluateBoolean(op, {'$date': new Date(1)})).to.true;
            });
            it(`should return false when property is a date object with date.getTime() <= 0`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$date'
                    }]
                };
                expect(evaluateBoolean(op, {'$date': new Date(0)})).to.false;
            });
            it(`should return false when property is unknown type`, function() {
                var op = {
                    'operator': BOOLEAN_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$unknown'
                    }]
                };
                expect(evaluateBoolean(op, {'$unknown': null})).to.false;
            });
        });
        describe(`toDateTime`, function() {
            it(`should throw on invalid input`, function () {
                // empty input
                expect(() => evaluateDateTime({}, {})).to.throw('Invalid cast operator: datetime');
                // invalid operator type
                expect(() => evaluateDateTime({
                    'operator': DEFINED_OPERATOR,
                    'children': [{'literal': 1}]
                }, {})).to.throw('Invalid cast operator: datetime');
                // invalid number of children
                expect(() => evaluateDateTime({
                    'operator': DATETIME_OPERATOR,
                    'children': [{'literal': 1}, {'literal': 2}]
                }, {})).to.throw('Invalid cast operator: datetime');
            });
            it(`should correctly cast number to date`, function() {
                var op = {
                    'operator': DATETIME_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$number'
                    }]
                };
                expect(evaluateDateTime(op, {'$number': 0})).to.eql(new Date(0));
            });
            it(`should correctly cast string to date`, function() {
                var op = {
                    'operator': DATETIME_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$datestring'
                    }]
                };
                expect(evaluateDateTime(op, {'$datestring': '2019-01-01T00:00:00'})).to.eql(new Date('2019-01-01T00:00:00'));
            });
            it(`should cast invalid string to undefined`, function() {
                var op = {
                    'operator': DATETIME_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$datestring'
                    }]
                };
                expect(evaluateDateTime(op, {'$datestring': ''})).to.null;
            });
        });
        describe(`toList`, function() {
            it(`should throw on invalid input`, function () {
                // empty input
                expect(() => evaluateList({}, {})).to.throw('Invalid cast operator: list');
                // invalid operator type
                expect(() => evaluateList({
                    'operator': DEFINED_OPERATOR,
                    'children': [{'literal': 1}]
                }, {})).to.throw('Invalid cast operator: list');
                // invalid number of children
                expect(() => evaluateList({
                    'operator': LIST_OPERATOR,
                    'children': [{'literal': 1}, {'literal': 2}]
                }, {})).to.throw('Invalid cast operator: list');
            });
            it(`should return list for list properties`, function () {
                var op = {
                    'operator': LIST_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$list'
                    }]
                };
                expect(evaluateList(op, {'$list': [1,2]})).to.eql([1,2]);
            });
            it(`should return undefined for non list types`, function () {
                var op = {
                    'operator': LIST_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$prop'
                    }]
                };
                expect(evaluateList(op, {'$prop': ''})).to.null;
                expect(evaluateList(op, {'$prop': 1})).to.null;
                expect(evaluateList(op, {'$prop': true})).to.null;
                expect(evaluateList(op, {'$prop': {}})).to.null;
                expect(evaluateList(op, {'$prop': null})).to.null;
                expect(evaluateList(op, {})).to.null;
            });
        });
        describe(`toString`, function() {
            it(`should throw on invalid input`, function () {
                // empty input
                expect(() => evaluateString({}, {})).to.throw('Invalid cast operator: string');
                // invalid operator type
                expect(() => evaluateString({
                    'operator': DEFINED_OPERATOR,
                    'children': [{'literal': 1}]
                }, {})).to.throw('Invalid cast operator: string');
                // invalid number of children
                expect(() => evaluateString({
                    'operator': STRING_OPERATOR,
                    'children': [{'literal': 1}, {'literal': 2}]
                }, {})).to.throw('Invalid cast operator: string');
            });
            it(`should return stringified values`, function () {
                var op = {
                    'operator': STRING_OPERATOR,
                    'children': [{
                        'property': EVENT_PROPERTY,
                        'value': '$prop'
                    }]
                };
                expect(evaluateString(op, {'$prop': 1})).to.equal('1');
                expect(evaluateString(op, {'$prop': [1,2]})).to.equal('[1,2]');
                expect(evaluateString(op, {'$prop': {a: 'b'}})).to.equal('{"a":"b"}');
                expect(evaluateString(op, {})).to.equal('null');
                expect(evaluateString(op, {'$prop': null})).to.equal('null');
                expect(evaluateString(op, {'$prop': true})).to.equal('true');
                expect(evaluateString(op, {'$prop': new Date(0)})).to.equal('1970-01-01T00:00:00.000Z');
            });
        });
    });

    describe(`Logical Operators`, function() {
        describe(`evaluateAnd`, function() {
            it(`should throw on invalid input`, function () {
                // empty input
                expect(() => evaluateAnd({}, {})).to.throw('Invalid operator: AND');
                // invalid operator type
                expect(() => evaluateAnd({
                    'operator': DEFINED_OPERATOR,
                    'children': [{'literal': 1}]
                }, {})).to.throw('Invalid operator: AND');
                // invalid number of children
                expect(() => evaluateAnd({
                    'operator': AND_OPERATOR,
                    'children': [{'literal': 1}]
                }, {})).to.throw('Invalid operator: AND');
            });
            it(`should return false if any value is false`, function () {
                var op = {
                    'operator': AND_OPERATOR,
                    'children': [
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop1'
                        },
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop2'
                        }
                    ]
                };
                expect(evaluateAnd(op, {'$prop1': true, '$prop2': false})).to.false;
                expect(evaluateAnd(op, {'$prop1': false, '$prop2': false})).to.false;
            });
            it(`should return true if all values are true`, function () {
                var op = {
                    'operator': AND_OPERATOR,
                    'children': [
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop1'
                        },
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop2'
                        }
                    ]
                };
                expect(evaluateAnd(op, {'$prop1': true, '$prop2': true})).to.true;
            });
            it(`should work properly for nested operators`, function () {
                var op = {
                    'operator': AND_OPERATOR,
                    'children': [
                        {
                            'operator': AND_OPERATOR,
                            'children': [
                                {
                                    'property': EVENT_PROPERTY,
                                    'value': '$prop1'
                                },
                                {
                                    'property': EVENT_PROPERTY,
                                    'value': '$prop2'
                                }
                            ]
                        },
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop1'
                        }
                    ]
                };
                expect(evaluateAnd(op, {'$prop1': true, '$prop2': true})).to.true;
            });
        });
        describe(`evaluateOr`, function() {
            it(`should throw on invalid input`, function () {
                // empty input
                expect(() => evaluateOr({}, {})).to.throw('Invalid operator: OR');
                // invalid operator type
                expect(() => evaluateOr({
                    'operator': DEFINED_OPERATOR,
                    'children': [{'literal': 1}]
                }, {})).to.throw('Invalid operator: OR');
                // invalid number of children
                expect(() => evaluateOr({
                    'operator': OR_OPERATOR,
                    'children': [{'literal': 1}]
                }, {})).to.throw('Invalid operator: OR');
            });
            it(`should return false if all values are false`, function () {
                var op = {
                    'operator': OR_OPERATOR,
                    'children': [
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop1'
                        },
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop2'
                        }
                    ]
                };
                expect(evaluateOr(op, {'$prop1': false, '$prop2': false})).to.false;
                expect(evaluateOr(op, {'$prop1': false, '$prop2': false})).to.false;
            });
            it(`should return true if any value is true`, function () {
                var op = {
                    'operator': OR_OPERATOR,
                    'children': [
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop1'
                        },
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop2'
                        }
                    ]
                };
                expect(evaluateOr(op, {'$prop1': true, '$prop2': false})).to.true;
            });
            it(`should work properly for nested operators`, function () {
                var op = {
                    'operator': OR_OPERATOR,
                    'children': [
                        {
                            'operator': AND_OPERATOR,
                            'children': [
                                {
                                    'property': EVENT_PROPERTY,
                                    'value': '$prop1'
                                },
                                {
                                    'property': EVENT_PROPERTY,
                                    'value': '$prop2'
                                }
                            ]
                        },
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop1'
                        }
                    ]
                };
                expect(evaluateOr(op, {'$prop1': true, '$prop2': false})).to.true;
            });
        });
        describe(`evaluateIn`, function() {
            it(`should throw on invalid input`, function () {
                // empty input
                expect(() => evaluateIn({}, {})).to.throw('Invalid operator: IN');
                // invalid operator type
                expect(() => evaluateIn({
                    'operator': DEFINED_OPERATOR,
                    'children': [{'literal': 1}]
                }, {})).to.throw('Invalid operator: IN');
                // invalid number of children
                expect(() => evaluateIn({
                    'operator': IN_OPERATOR,
                    'children': [{'literal': 1}]
                }, {})).to.throw('Invalid operator: IN');
                // invalid type of children
                expect(() => evaluateIn({
                    'operator': IN_OPERATOR,
                    'children': [{'literal': 1}, {'literal': 2}]
                }, {})).to.throw('Invalid operand for operator IN: invalid type');
            });
            it(`should return true if value is a substring`, function () {
                var op = {
                    'operator': IN_OPERATOR,
                    'children': [
                        {
                            'property': LITERAL_PROPERTY,
                            'value': 'test'
                        },
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop'
                        }
                    ]
                };
                expect(evaluateIn(op, {'$prop': 'this is a test sentence'})).to.true;
                expect(evaluateIn(op, {'$prop': 'this is atestsentence'})).to.true;
            });
            it(`should return false if value is not a substring`, function () {
                var op = {
                    'operator': IN_OPERATOR,
                    'children': [
                        {
                            'property': LITERAL_PROPERTY,
                            'value': 'test'
                        },
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop'
                        }
                    ]
                };
                expect(evaluateIn(op, {'$prop': 'this is a tset sentence'})).to.false;
            });
            it(`should return true if value is in the list`, function () {
                var op = {
                    'operator': IN_OPERATOR,
                    'children': [
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop1'
                        },
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop2'
                        }
                    ]
                };
                expect(evaluateIn(op, {'$prop1': 1, '$prop2': [2, 3, 1]})).to.true;
                expect(evaluateIn(op, {'$prop1': 'test', '$prop2': ['this', 'is', 'test']})).to.true;
            });
            it(`should return false if value is in not in the list`, function () {
                var op = {
                    'operator': IN_OPERATOR,
                    'children': [
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop1'
                        },
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop2'
                        }
                    ]
                };
                expect(evaluateIn(op, {'$prop1': 1, '$prop2': [2, 3, 12]})).to.false;
                expect(evaluateIn(op, {'$prop1': 'test', '$prop2': ['this', 'istest']})).to.false;
            });
        });
    });
    describe(`Arithmetic Operators`, function() {
        describe(`evaluatePlus`, function() {
            it(`should throw on invalid input`, function () {
                // empty input
                expect(() => evaluatePlus({}, {})).to.throw('Invalid operator: PLUS');
                // invalid operator type
                expect(() => evaluatePlus({
                    'operator': DEFINED_OPERATOR,
                    'children': [{'literal': 1}]
                }, {})).to.throw('Invalid operator: PLUS');
                // invalid number of children
                expect(() => evaluatePlus({
                    'operator': PLUS_OPERATOR,
                    'children': [{'literal': 1}]
                }, {})).to.throw('Invalid operator: PLUS');
            });
            it(`should return sum if values are numbers`, function () {
                var op = {
                    'operator': PLUS_OPERATOR,
                    'children': [
                        {
                            'property': LITERAL_PROPERTY,
                            'value': 1
                        },
                        {
                            'property': LITERAL_PROPERTY,
                            'value': 2
                        }
                    ]
                };
                expect(evaluatePlus(op, {})).to.equal(3);
            });
            it(`should return concatenated string if values are strings`, function () {
                var op = {
                    'operator': PLUS_OPERATOR,
                    'children': [
                        {
                            'property': LITERAL_PROPERTY,
                            'value': '1'
                        },
                        {
                            'property': LITERAL_PROPERTY,
                            'value': '2'
                        }
                    ]
                };
                expect(evaluatePlus(op, {})).to.equal('12');
            });
            it(`should return undefined for all other types`, function () {
                var op = {
                    'operator': PLUS_OPERATOR,
                    'children': [
                        {
                            'property': LITERAL_PROPERTY,
                            'value': 'test'
                        },
                        {
                            'property': EVENT_PROPERTY,
                            'value': '$prop'
                        }
                    ]
                };
                expect(evaluatePlus(op, {'$prop': 1})).to.null;
            });
        });
        it(`should throw on invalid input`, function () {
            // empty input
            expect(() => evaluateArithmetic({}, {})).to.throw('Invalid arithmetic operator');
            // invalid operator type
            expect(() => evaluateArithmetic({
                'operator': DEFINED_OPERATOR,
                'children': [{'literal': 1}]
            }, {})).to.throw('Invalid arithmetic operator');
            // invalid number of children
            expect(() => evaluateArithmetic({
                'operator': MINUS_OPERATOR,
                'children': [{'literal': 1}]
            }, {})).to.throw('Invalid arithmetic operator');
        });
        it(`should return correct values for arithmetic operations on numbers`, function() {
            var op = {
                'operator': MINUS_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    },
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop'
                    }
                ]
            };
            expect(evaluateArithmetic(op, {'$prop0': 1, '$prop': 2})).to.equal(-1);
            op.operator = MUL_OPERATOR;
            expect(evaluateArithmetic(op, {'$prop0': 1, '$prop': 2})).to.equal(2);
            op.operator = DIV_OPERATOR;
            expect(evaluateArithmetic(op, {'$prop0': 1, '$prop': 2})).to.equal(0.5);
            expect(evaluateArithmetic(op, {'$prop0': 1, '$prop': 0})).to.null;
            op.operator = MOD_OPERATOR;
            expect(evaluateArithmetic(op, {'$prop0': 1, '$prop': 0})).to.null;
            expect(evaluateArithmetic(op, {'$prop0': 0, '$prop': 1})).to.equal(0);
            expect(evaluateArithmetic(op, {'$prop0': -1, '$prop': 2})).to.equal(1);
            expect(evaluateArithmetic(op, {'$prop0': -1, '$prop': -2})).to.equal(-1);
            expect(evaluateArithmetic(op, {'$prop0': 1, '$prop': -2})).to.equal(-1);
        });
        it(`should return nukk for arithmetic operations on non numeric values`, function() {
            var op = {
                'operator': MINUS_OPERATOR,
                'children': [
                    {
                        'property': LITERAL_PROPERTY,
                        'value': 1
                    },
                    {
                        'property': LITERAL_PROPERTY,
                        'value': '$prop'
                    }
                ]
            };
            expect(evaluateArithmetic(op, {})).to.null;
            op.operator = MUL_OPERATOR;
            expect(evaluateArithmetic(op, {})).to.null;
            op.operator = DIV_OPERATOR;
            expect(evaluateArithmetic(op, {})).to.null;
            op.operator = MOD_OPERATOR;
            expect(evaluateArithmetic(op, {})).to.null;
        });
    });
    describe(`evaluateEquality`, function() {
        it(`should throw on invalid input`, function() {
           // empty input
            expect(() => evaluateEquality({}, {})).to.throw('Invalid equality operator');
            // invalid operator type
            expect(() => evaluateEquality({
                'operator': DEFINED_OPERATOR,
                'children': [{'literal': 1}]
            }, {})).to.throw('Invalid equality operator');
            // invalid number of children
            expect(() => evaluateEquality({
                'operator': EQUALS_OPERATOR,
                'children': [{'literal': 1}]
            }, {})).to.throw('Invalid equality operator');
        });
        it(`should return true`, function() {
            var op = {
                'operator': EQUALS_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    },
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop'
                    }
                ]
            };
            expect(evaluateEquality(op, {'$prop0': undefined, '$prop': undefined})).to.true;
            expect(evaluateEquality(op, {'$prop0': null, '$prop': null})).to.true;
            expect(evaluateEquality(op, {'$prop0': 1, '$prop': 1})).to.true;
            expect(evaluateEquality(op, {'$prop0': '1', '$prop': '1'})).to.true;
            expect(evaluateEquality(op, {'$prop0': false, '$prop': false})).to.true;
            expect(evaluateEquality(op, {'$prop0': [1,2,3], '$prop': [1,2,3]})).to.true;
            expect(evaluateEquality(op, {'$prop0': {'1':'1', '2': '2'}, '$prop': {'2': '2', '1': '1'}})).to.true;
            expect(evaluateEquality(op, {'$prop0': new Date(0), '$prop': new Date(0)})).to.true;
        });
        it(`should return not true`, function() {
            var op = {
                'operator': NOT_EQUALS_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    },
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop'
                    }
                ]
            };
            expect(evaluateEquality(op, {'$prop0': undefined, '$prop': undefined})).to.false;
            expect(evaluateEquality(op, {'$prop0': null, '$prop': null})).to.false;
            expect(evaluateEquality(op, {'$prop0': 1, '$prop': 1})).to.false;
            expect(evaluateEquality(op, {'$prop0': '1', '$prop': '1'})).to.false;
            expect(evaluateEquality(op, {'$prop0': false, '$prop': false})).to.false;
            expect(evaluateEquality(op, {'$prop0': [1,2,3], '$prop': [1,2,3]})).to.false;
            expect(evaluateEquality(op, {'$prop0': {'1':'1'}, '$prop': {'1': '1'}})).to.false;
            expect(evaluateEquality(op, {'$prop0': new Date(0), '$prop': new Date(0)})).to.false;
        });
        it(`should return false`, function() {
            var op = {
                'operator': EQUALS_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    },
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop'
                    }
                ]
            };
            expect(evaluateEquality(op, {'$prop0': 1, '$prop': undefined})).to.false;
            expect(evaluateEquality(op, {'$prop0': 1, '$prop': null})).to.false;
            expect(evaluateEquality(op, {'$prop0': 1, '$prop': 2})).to.false;
            expect(evaluateEquality(op, {'$prop0': '1', '$prop': '2'})).to.false;
            expect(evaluateEquality(op, {'$prop0': '1', '$prop': 1})).to.false;
            expect(evaluateEquality(op, {'$prop0': true, '$prop': false})).to.false;
            expect(evaluateEquality(op, {'$prop0': [1,2,3], '$prop': [3,2,1]})).to.false;
            expect(evaluateEquality(op, {'$prop0': {'1':'1'}, '$prop': {'1': '2'}})).to.false;
            expect(evaluateEquality(op, {'$prop0': new Date(0), '$prop': new Date(1)})).to.false;
            expect(evaluateEquality(op, {'$prop0': new Date(0), '$prop': {}})).to.false;
        });
        it(`should return not false`, function() {
            var op = {
                'operator': NOT_EQUALS_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    },
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop'
                    }
                ]
            };
            expect(evaluateEquality(op, {'$prop0': 1, '$prop': undefined})).to.true;
            expect(evaluateEquality(op, {'$prop0': 1, '$prop': null})).to.true;
            expect(evaluateEquality(op, {'$prop0': 1, '$prop': 2})).to.true;
            expect(evaluateEquality(op, {'$prop0': '1', '$prop': '2'})).to.true;
            expect(evaluateEquality(op, {'$prop0': '1', '$prop': 1})).to.true;
            expect(evaluateEquality(op, {'$prop0': true, '$prop': false})).to.true;
            expect(evaluateEquality(op, {'$prop0': [1,2,3], '$prop': [3,2,1]})).to.true;
            expect(evaluateEquality(op, {'$prop0': {'1':'1'}, '$prop': {'1': '2'}})).to.true;
            expect(evaluateEquality(op, {'$prop0': new Date(0), '$prop': new Date(1)})).to.true;
            expect(evaluateEquality(op, {'$prop0': new Date(0), '$prop': {}})).to.true;
        });
    });
    describe(`evaluateComparison`, function() {
        it(`should throw on invalid input`, function() {
           // empty input
            expect(() => evaluateComparison({}, {})).to.throw('Invalid comparison operator');
            // invalid operator type
            expect(() => evaluateComparison({
                'operator': DEFINED_OPERATOR,
                'children': [{'literal': 1}]
            }, {})).to.throw('Invalid comparison operator');
            // invalid number of children
            expect(() => evaluateComparison({
                'operator': GREATER_OPERATOR,
                'children': [{'literal': 1}]
            }, {})).to.throw('Invalid comparison operator');
        });
        it(`should return correct values for numeric comparisons`, function() {
            var op = {
                'operator': GREATER_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    },
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop'
                    }
                ]
            };
            expect(evaluateComparison(op, {'$prop0': 1, '$prop': 2})).to.false;
            expect(evaluateComparison(op, {'$prop0': 1, '$prop': 1})).to.false;
            expect(evaluateComparison(op, {'$prop0': 2, '$prop': 1})).to.true;
            op.operator = GREATER_EQUAL_OPERATOR;
            expect(evaluateComparison(op, {'$prop0': 1, '$prop': 1})).to.true;
            op.operator = LESS_OPERATOR;
            expect(evaluateComparison(op, {'$prop0': 1, '$prop': 2})).to.true;
            expect(evaluateComparison(op, {'$prop0': 1, '$prop': 1})).to.false;
            expect(evaluateComparison(op, {'$prop0': 2, '$prop': 1})).to.false;
            op.operator = LESS_EQUAL_OPERATOR;
            expect(evaluateComparison(op, {'$prop0': 1, '$prop': 1})).to.true;
        });
        it(`should return correct values for date comparisons`, function() {
            var op = {
                'operator': GREATER_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    },
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop'
                    }
                ]
            };
            expect(evaluateComparison(op, {'$prop0': new Date(1), '$prop': new Date(2)})).to.false;
            expect(evaluateComparison(op, {'$prop0': new Date(1), '$prop': new Date(1)})).to.false;
            expect(evaluateComparison(op, {'$prop0': new Date(2), '$prop': new Date(1)})).to.true;
            op.operator = GREATER_EQUAL_OPERATOR;
            expect(evaluateComparison(op, {'$prop0': new Date(1), '$prop': new Date(1)})).to.true;
            op.operator = LESS_OPERATOR;
            expect(evaluateComparison(op, {'$prop0': new Date(1), '$prop': new Date(2)})).to.true;
            expect(evaluateComparison(op, {'$prop0': new Date(1), '$prop': new Date(1)})).to.false;
            expect(evaluateComparison(op, {'$prop0': new Date(2), '$prop': new Date(1)})).to.false;
            op.operator = LESS_EQUAL_OPERATOR;
            expect(evaluateComparison(op, {'$prop0': new Date(1), '$prop': new Date(1)})).to.true;
        });
        it(`should return correct values for string comparisons`, function() {
            var op = {
                'operator': GREATER_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    },
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop'
                    }
                ]
            };
            expect(evaluateComparison(op, {'$prop0': '12', '$prop': '2'})).to.false;
            expect(evaluateComparison(op, {'$prop0': '12', '$prop': '12'})).to.false;
            expect(evaluateComparison(op, {'$prop0': '2', '$prop': '12'})).to.true;
            op.operator = GREATER_EQUAL_OPERATOR;
            expect(evaluateComparison(op, {'$prop0': '1', '$prop': '1'})).to.true;
            op.operator = LESS_OPERATOR;
            expect(evaluateComparison(op, {'$prop0': '12', '$prop': '2'})).to.true;
            expect(evaluateComparison(op, {'$prop0': '12', '$prop': '12'})).to.false;
            expect(evaluateComparison(op, {'$prop0': '2', '$prop': '12'})).to.false;
            op.operator = LESS_EQUAL_OPERATOR;
            expect(evaluateComparison(op, {'$prop0': '1', '$prop': '1'})).to.true;
        });
        it(`should return null for non numeric comparisons`, function() {
            var op = {
                'operator': GREATER_EQUAL_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    },
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop'
                    }
                ]
            };
            expect(evaluateComparison(op, {'$prop0': 1, '$prop': undefined})).to.null;
            expect(evaluateComparison(op, {'$prop0': 1, '$prop': '1'})).to.null;
        });
    });
    describe(`evaluateDefined`, function() {
        it(`should throw on invalid input`, function() {
           // empty input
            expect(() => evaluateDefined({}, {})).to.throw('Invalid defined/not defined operator');
            // invalid operator type
            expect(() => evaluateDefined({
                'operator': IN_OPERATOR,
                'children': [{'literal': 1}]
            }, {})).to.throw('Invalid defined/not defined operator');
            // invalid number of children
            expect(() => evaluateDefined({
                'operator': DEFINED_OPERATOR,
                'children': [{'literal': 1}, {'literal': 1}]
            }, {})).to.throw('Invalid defined/not defined operator');
        });
        it(`should return correct values`, function() {
            var op = {
                'operator': DEFINED_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    }
                ]
            };
            expect(evaluateDefined(op, {'$prop0': 1})).to.true;
            expect(evaluateDefined(op, {'$prop0': undefined})).to.false;
            expect(evaluateDefined(op, {})).to.false;
            op.operator = NOT_DEFINED_OPERATOR;
            expect(evaluateDefined(op, {'$prop0': 1})).to.false;
            expect(evaluateDefined(op, {'$prop0': undefined})).to.true;
            expect(evaluateDefined(op, {})).to.true;
        });
    });
    describe(`evaluateNot`, function() {
        it(`should throw on invalid input`, function() {
           // empty input
            expect(() => evaluateNot({}, {})).to.throw('Invalid not operator');
            // invalid operator type
            expect(() => evaluateNot({
                'operator': IN_OPERATOR,
                'children': [{'literal': 1}]
            }, {})).to.throw('Invalid not operator');
            // invalid number of children
            expect(() => evaluateNot({
                'operator': NOT_OPERATOR,
                'children': [{'literal': 1}, {'literal': 1}]
            }, {})).to.throw('Invalid not operator');
        });
        it(`should return correct values for boolean/undefined`, function() {
            var op = {
                'operator': NOT_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    }
                ]
            };
            expect(evaluateNot(op, {'$prop0': true})).to.false;
            expect(evaluateNot(op, {'$prop0': false})).to.true;
            expect(evaluateNot(op, {'$prop0': undefined})).to.true;
        });
        it(`should return undefined for non boolean/undefined`, function() {
            var op = {
                'operator': NOT_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    }
                ]
            };
            expect(evaluateNot(op, {'$prop0': 1})).to.null;
        });
    });
    describe(`evaluateOperator`, function() {
        it(`should throw on invalid input`, function() {
           // empty input
            expect(() => evaluateOperator({}, {})).to.throw('Invalid operator: operator key missing');
        });
        it(`should return correct values`, function() {
            var op = {
                'operator': AND_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    },
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop1'
                    }
                ]
            };
            expect(evaluateOperator(op, {'$prop0': true, '$prop1': false})).to.false;
            op.operator = OR_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': true, '$prop1': false})).to.true;
            op.operator = IN_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1, '$prop1': [1,2]})).to.true;
            op.operator = NOT_IN_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1, '$prop1': [1,2]})).to.false;
            op.operator = PLUS_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1, '$prop1': 1})).to.equal(2);
            op.operator = MINUS_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1, '$prop1': 1})).to.equal(0);
            op.operator = MUL_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1, '$prop1': 1})).to.equal(1);
            op.operator = DIV_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1, '$prop1': 1})).to.equal(1);
            op.operator = MOD_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1, '$prop1': 1})).to.equal(0);
            op.operator = EQUALS_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1, '$prop1': 1})).to.true;
            op.operator = NOT_EQUALS_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1, '$prop1': 1})).to.false;
            op.operator = GREATER_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1, '$prop1': 1})).to.false;
            op.operator = GREATER_EQUAL_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1, '$prop1': 1})).to.true;
            op.operator = LESS_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1, '$prop1': 1})).to.false;
            op.operator = LESS_EQUAL_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1, '$prop1': 1})).to.true;

            op.children = [{
                'property': EVENT_PROPERTY,
                'value': '$prop0'
            }]
            op.operator = BOOLEAN_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1})).to.true;
            op.operator = DATETIME_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1})).to.eql(new Date(1));
            op.operator = LIST_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': [1]})).to.eql([1]);
            op.operator = NUMBER_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': '1'})).to.equal(1);
            op.operator = STRING_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1})).to.equal('1');
            op.operator = DEFINED_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1})).to.true;
            op.operator = NOT_DEFINED_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': 1})).to.false;
            op.operator = NOT_OPERATOR;
            expect(evaluateOperator(op, {'$prop0': true})).to.false;
        });
    });
    describe(`evaluateWindow`, function() {
       it(`should throw on invalid input`, function() {
           // empty input
            expect(() => evaluateWindow({})).to.throw('Invalid window: missing required keys');
            expect(() => evaluateWindow({window: {}})).to.throw('Invalid window: missing required keys');
            expect(() => evaluateWindow({window: {unit: 'day'}})).to.throw('Invalid window: missing required keys');
            expect(() => evaluateWindow({window: {value: 1}})).to.throw('Invalid window: missing required keys');
            expect(() => evaluateWindow({window: {unit: 'blah', value: 1}})).to.throw('Invalid unit:');
        });
       it(`should return correct values after applying offsets`, function() {
          var wdw = {
              'window': {
                  'value': -1,
                  'unit': 'hour'
              }
          };
          var clock = sinon.useFakeTimers(new Date(2019, 1, 1, 0, 0, 0, 0).getTime());
          expect(evaluateWindow(wdw)).to.eql(new Date(2019, 1, 1, 1, 0, 0, 0));
          wdw.window.unit = 'day';
          expect(evaluateWindow(wdw)).to.eql(new Date(2019, 1, 2, 0, 0, 0, 0));
          wdw.window.unit = 'week';
          expect(evaluateWindow(wdw)).to.eql(new Date(2019, 1, 8, 0, 0, 0, 0));
          wdw.window.unit = 'month';
          expect(evaluateWindow(wdw)).to.eql(new Date(2019, 1, 31, 0, 0, 0, 0));
          clock.restore();
       });
    });
    describe(`evaluateOperand`, function() {
        it(`should throw on invalid input`, function() {
           // empty input
            expect(() => evaluateOperand({}, {})).to.throw('Invalid operand: missing required keys');
            expect(() => evaluateOperand({property: 'should_fail', value: 1}, {})).to.throw('Invalid operand: Invalid property type');
        });
        it(`should return correct values for event properties/literal values`, function() {
            var op = {
                'operator': NOT_OPERATOR,
                'children': [
                    {
                        'property': EVENT_PROPERTY,
                        'value': '$prop0'
                    },
                    {
                        'property': LITERAL_PROPERTY,
                        'value': 'literal'
                    },
                    {
                        'property': LITERAL_PROPERTY,
                        'value': {
                            'window': {
                                'unit': 'day',
                                'value': -1
                            }
                        }
                    }
                ]
            };
            expect(evaluateOperand(op.children[0], {'$prop0': true})).to.true;
            expect(evaluateOperand(op.children[1], {'$prop0': false})).to.equal('literal');
            expect(evaluateOperand(op.children[1], {'$prop0': false})).to.equal('literal');
            expect(_.isDate(evaluateOperand(op.children[2], {'$prop0': false}))).to.true;
        });
    });
    describe(`evaluate`, function() {
        it(`should return correct values for nested children`, function() {
            var op = {
                'operator': AND_OPERATOR,
                'children': [
                    {
                        'operator': NOT_OPERATOR,
                        'children': [
                            {
                                'property': EVENT_PROPERTY,
                                'value': '$bool_false'
                            }
                        ]
                    },
                    {
                        'operator': EQUALS_OPERATOR,
                        'children': [
                            {
                                'property': EVENT_PROPERTY,
                                'value': '$number'
                            },
                            {
                                'operator': NUMBER_OPERATOR,
                                'children': [
                                    {
                                        'property': EVENT_PROPERTY,
                                        'value': '$number'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            expect(evaluateSelector(op, {'$bool_false': false, '$number': 1})).to.true;
            var notOp = {
                'operator': NOT_OPERATOR,
                'children': [op]
            };
            expect(evaluateSelector(notOp, {'$bool_false': false, '$number': 1})).to.false;
        });
    });
});
