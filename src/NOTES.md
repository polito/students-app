# Implementation notes

This document helps to keep track of important implementation details and decisions made during the development of the project.

## Inherent dependencies

### @react-navigation/material-top-tabs

Requires `react-native-pager-view` as a main dependency so that it can be bundled correctly by the native packagers.
