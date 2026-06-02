install:
	cd frontend && npm install
	@if [ -n "$$CONDA_PREFIX" ]; then \
		echo "conda env detected — installing into active env"; \
		pip install -r backend/requirements.txt; \
	else \
		echo "no conda env — creating backend/.venv"; \
		python -m venv backend/.venv && backend/.venv/bin/pip install -r backend/requirements.txt; \
	fi

dev:
	make -j2 dev-backend dev-frontend

dev-backend:
	@set -a && . ./.env && set +a && \
	if [ -n "$$CONDA_PREFIX" ]; then \
		cd backend && uvicorn main:app --reload --port 8000; \
	else \
		cd backend && .venv/bin/uvicorn main:app --reload --port 8000; \
	fi

dev-frontend:
	cd frontend && npm run dev

# ── Deploy ────────────────────────────────────────────────────────────────────

build:
	cd frontend && npm run build

infra-init:
	cd infra && terraform init

infra-plan:
	cd infra && terraform plan

infra-apply:
	cd infra && terraform apply

# Build, sync to S3, and invalidate CloudFront cache.
# Reads DISTRIBUTION_ID and BUCKET from terraform output; run `make infra-apply` first.
deploy: build
	$(eval BUCKET := $(shell cd infra && terraform output -raw s3_bucket))
	$(eval DIST_ID := $(shell cd infra && terraform output -raw cloudfront_distribution_id))
	aws s3 sync frontend/dist/ s3://$(BUCKET)/ --delete
	aws cloudfront create-invalidation --distribution-id $(DIST_ID) --paths "/*"
	@echo "Deployed → https://sitescope.grantwang.dev"
