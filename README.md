# Enforce Pull Request Title Style Action

This action analyses the titles of Pull Requests to ensure they start with a Jira Issue Key.  Issue Keys are a combination of a Project Key, a hyphen, and a number designating which issue it is.  In general, Project Keys are two capital letters but Jira does allow for [custom Project Keys](https://confluence.atlassian.com/adminjiraserver/changing-the-project-key-format-938847081.html) and this issue attempts to abide by the custom format. 

For example, if your project key were `AB` then the following would be allowed

```
AB-1 Initialize Project
```

However, the following examples would not be allowed

```
aB-1 Initialize Project
```

```
ab-1 Initialize Project
```

```
Ab 1 Initialize Project
```

Valid Pull Request titles must also include a short description after the Issue Key. Therefore the following is not valid. 

```
AB-1
```

Specifying a separator allows for using characters such as `:`, `-` or `_` to be between the Jira key and title. 
As an example with the separator `:` the following is allowed

```
AB-1:Initialize Project
```

Note that by specifying a separator the following would not be allowed

```
AB-1: Initialize Project
```

By default this action checks that the Jira Project Key is at the start of the title string. To allow for the Jira Project
Key to be anywhere in the title set the `keyAnywhereInTitle` property to `true`. With this property enabled and the project
key set to `AB` the following title is valid

```
Other: AB-1 Initialize Project
```

By default, this action will allow any valid Issue Key so long as it *could* be valid. If you want to be specific to your project, use the `projectKey` input for the action. 

## Inputs

### `projectKey`

A specific Project Key to always check for. Defaults to a space character.

### `separator`

A specific separator to use 

### `keyAnywhereInTitle`

Allows the Jira Project Key, Issue # and separator to be anywhere in the title. Defaults to false.

## Example Usage

```
- name: Enforce Jira Issue Key in Pull Request Title
  uses: ryanvade/enforce-pr-title-style-action@v2
```

## Example Usage with a specific Project Key

```
- name: Enforce Jira Issue Key in Pull Request Title
  uses: ryanvade/enforce-pr-title-style-action@v2
  with:
    projectKey: 'AB'
```

## Example Usage with a specific Project Key and a separator

```
- name: Enforce Jira Issue Key in Pull Request Title
  uses: ryanvade/enforce-pr-title-style-action@v2
  with:
    projectKey: 'AB'
    separator: ':'
```

## Example Usage with a specific Project Key and allowed to be anywhere in the title

```
- name: Enforce Jira Issue Key in Pull Request Title
  uses: ryanvade/enforce-pr-title-style-action@v2
  with:
    projectKey: 'AB'
    keyAnywhereInTitle: 'true'
```

Note that edits to a pull request title will not include the updated title as an input to this action
without specifying the `edited` type. See the [pull_request](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request)
event trigger documentation for more details. Thanks to @jdonboch for pointing this out.