# Enforce Pull Request Title Style Action

This action analyses the titles of Pull Requests to ensure they start with a Jira Issue Key.  Issue Keys are a combination of a Project Key, a hyphen, and a number designating which issue it is.  In general, Project Keys are two capital letters but Jira does allow for [custom Project Keys](https://confluence.atlassian.com/adminjiraserver/changing-the-project-key-format-938847081.html) and this issue attempts to abide by the custom format. 

For example, if your project key were `AB` then the following would be allowed

```
AB-1  Initialize Project
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

By default, this action will allow any valid Issue Key so long as it *could* be valid. If you want to be specific to your project, use the `projectKey` input for the action. 

## Inputs

### `projectKey`

A specific Project Key to always check for. 

## Example Usage

```
- name: Enforce Jira Issue Key in Pull Request Title
  uses: ryanvade/enforce-pr-title-style-action@v1
```

## Example Usage with a specific Project Key

```
- name: Enforce Jira Issue Key in Pull Request Title
  uses: ryanvade/enforce-pr-title-style-action@v1
  with:
    projectKey: AB
```