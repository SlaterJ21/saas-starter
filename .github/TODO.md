# CI/CD TODO Items

## Security Scanning

**Status:** Partially Working  
**Priority:** Low  
**Assigned:** TBD

### Current State
- Trivy vulnerability scanner runs successfully
- Scans Docker images for CRITICAL and HIGH vulnerabilities
- Results displayed in Actions log output

### Issue
- SARIF file generation not working consistently
- GitHub Security tab integration disabled
- Error: "Path does not exist: trivy-results.sarif"

### Next Steps
1. Debug why Trivy isn't creating SARIF output file
2. Investigate Trivy action version compatibility
3. Test with explicit working directory
4. Re-enable GitHub Security upload once SARIF works

### References
- [Trivy Action Docs](https://github.com/aquasecurity/trivy-action)
- [GitHub Security SARIF Upload](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/uploading-a-sarif-file-to-github)

### Workaround
Currently using table format output in logs instead of SARIF.
Vulnerabilities are still detected and visible, just not in Security tab.

---

## Future Enhancements

### CI/CD
- [ ] Add automated tests (unit, integration)
- [ ] Add E2E tests with Playwright
- [ ] Deploy to staging environment automatically
- [ ] Add deployment notifications (Slack/Discord)
- [ ] Implement blue-green deployments

### Kubernetes
- [ ] Automated K8s deployment on main branch
- [ ] Horizontal Pod Autoscaler configuration
- [ ] Network policies for pod communication
- [ ] Ingress with TLS/SSL certificates
- [ ] Secrets management (Sealed Secrets or Vault)

### Monitoring
- [ ] Prometheus metrics collection
- [ ] Grafana dashboards
- [ ] Alert configuration
- [ ] Log aggregation (ELK or Loki)
